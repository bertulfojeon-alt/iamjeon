import { expect, test, type Page } from "@playwright/test";

const phase = (page: Page) => page.locator("section[data-phase]");

/** Back at the top, with the glide there finished (Lenis ignores input while it runs). */
async function topOfPage(page: Page) {
  await page.waitForFunction(() => window.scrollY === 0, null, { timeout: 5000 });
  await page.waitForTimeout(400); // the eased glide's last stretch, all under a pixel
}

/** The desk without the film: the HUD's "Work" skips it. */
async function toDesk(page: Page) {
  await page.goto("/");
  const work = page.getByRole("button", { name: "Work", exact: true });
  if (await work.isVisible()) await work.click();
  else {
    // Phones hide the HUD's Work link: scroll into the film and skip it.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.mouse.wheel(0, 160);
    await page.getByRole("button", { name: "Skip" }).click({ timeout: 8000 }).catch(() => {});
  }
  await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 8000 });
}

/** WCAG contrast of an element's text against the first opaque background behind it. */
function contrast(locator: ReturnType<Page["locator"]>) {
  return locator.evaluate((el) => {
    const rgb = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const lum = (c: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    let bgEl: Element | null = el;
    let bg = "rgba(0, 0, 0, 0)";
    while (bgEl && (bg = getComputedStyle(bgEl).backgroundColor).endsWith(", 0)")) bgEl = bgEl.parentElement;
    const a = lum(rgb(getComputedStyle(el).color));
    const b = lum(rgb(bg));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

/** First scroll from the welcome screen: the copy leaves and the film starts. */
async function scrollIntoFilm(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.mouse.wheel(0, 160);
  await expect(phase(page)).toHaveAttribute("data-phase", /film|desk/, { timeout: 8000 });
}

test.describe("welcome", () => {
  test("opens on the promise, the visitor's time and the name as a credit", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("While your office sleeps, your systems keep working.");
    await expect(page.getByText(/A night shift by .*Saquilabon Jr\./)).toBeVisible();
    await expect(page.getByText(/in Lapu-Lapu City/).first()).toBeVisible();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
  });

  test("never scrolls sideways", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("picks the right viewing mode", async ({ page }, info) => {
    await page.goto("/");
    const mode = await page.evaluate(() => document.documentElement.dataset.mode);
    expect(mode).toBe(info.project.name === "phone" ? "lite" : "full");
  });
});

test.describe("welcome, visitor abroad", () => {
  test.use({ timezoneId: "America/New_York" });
  test("shows the visitor's own time next to Lapu-Lapu's", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/where you are/)).toBeVisible();
  });
});

test.describe("the film", () => {
  test("the first scroll plays it, holds the page, then lands on the desk", async ({ page }) => {
    await scrollIntoFilm(page);
    await expect(phase(page)).toHaveAttribute("data-phase", "film");
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 15000 });
    // The desk keeps the page itself still (only the screen's panels scroll)…
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    // …until the back-to-top button releases it.
    await page.getByRole("button", { name: "Back to the top" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("Skip and Esc end it straight away", async ({ page }) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");

    // Back to the hero and down again: it plays again, and Esc skips.
    await page.getByRole("button", { name: "Back to the top" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await page.mouse.wheel(0, 200);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
    await page.keyboard.press("Escape");
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("'See what I'd build for you' plays the film; the HUD's Work skips it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "See what I'd build for you" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
    await page.keyboard.press("Escape");
    await toDesk(page);
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
  });
});

test.describe("back to the top", () => {
  test("at the desk, scrolling up never returns to the hero; the back-to-top button does", async ({ page }) => {
    await toDesk(page);
    await page.mouse.move(20, 400);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(1500);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
    await page.getByRole("button", { name: "Back to the top" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    // From the hero, scrolling down plays the film again.
    await page.mouse.wheel(0, 200);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
  });

  test("at the desk the page itself stays put: scrolling over the top bar never reveals the hero copy", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "desktop wheel path");
    await toDesk(page);
    const y0 = await page.evaluate(() => window.scrollY);
    await page.mouse.move(700, 20); // over the HUD, outside every scrolling panel
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    await expect(page.getByRole("heading", { level: 1 })).not.toBeInViewport();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("a reload starts at the welcome", async ({ page }) => {
    await toDesk(page);
    await page.reload();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await page.waitForTimeout(800);
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await page.mouse.wheel(0, 160);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
  });
});

test.describe("the desk dashboard", () => {
  const grid = (page: Page) => page.locator("#desk").getByRole("region", { name: "All work" });
  const pane = (page: Page, name: string) => page.locator("#desk").getByRole("region", { name });
  const card = (page: Page, title: string) => grid(page).getByRole("link", { name: title, exact: true });
  const chips = (page: Page) => grid(page).getByRole("group", { name: "Filter by category" });
  const screenNav = (page: Page) => page.locator("#desk").getByRole("navigation", { name: "Screen" });
  const openProject = async (page: Page, title: string) => {
    await card(page, title).click();
    await expect(pane(page, title)).toBeVisible();
  };

  test("All work opens as a grid of every project; a card (not a hover) opens one at its own address", async ({ page }) => {
    await toDesk(page);
    await expect(grid(page).getByRole("heading", { level: 2 })).toHaveText("Projects");
    await expect(grid(page).getByRole("listitem")).toHaveCount(21);
    await card(page, "TG Auto Trader").hover();
    await page.waitForTimeout(300);
    await expect(grid(page)).toBeVisible();
    await openProject(page, "TG Auto Trader");
    await expect(pane(page, "TG Auto Trader").getByRole("heading", { level: 2 }).first()).toHaveText("TG Auto Trader");
    await expect(page).toHaveURL(/\/work\/tg-auto-trader$/);
    await expect(page.getByRole("banner")).toHaveAttribute("data-surface", "dark");
  });

  test("each card shows its status, a short summary and its main tools", async ({ page }) => {
    await toDesk(page);
    const tg = grid(page).getByRole("listitem").filter({ has: page.getByRole("link", { name: "TG Auto Trader", exact: true }) });
    await expect(tg).toContainText("Built");
    await expect(tg).toContainText("Telegram-to-MT5 trading desk");
    await expect(tg).toContainText("Next.js 14");
    await expect(grid(page).getByRole("listitem").filter({ has: page.getByRole("link", { name: "Project Payday", exact: true }) })).toContainText("NDA");
  });

  test("category filters narrow the grid and show how many projects each holds", async ({ page }, info) => {
    await toDesk(page);
    const phone = info.project.name === "phone";
    // Desktop filters from the sidebar alone; phones, where the sidebar sits below the grid, keep chips above it.
    await expect(chips(page)).toHaveCount(phone ? 1 : 0);
    const filters = phone ? chips(page) : page.locator("#desk").getByRole("complementary", { name: "Browse" });
    await filters.getByRole("button", { name: /^Trading\s*\d/ }).click();
    await expect(grid(page).getByRole("listitem")).toHaveCount(5);
    await expect(filters.getByRole("button", { name: /^Trading\s*\d/ })).toHaveAttribute("aria-pressed", "true");
    await filters.getByRole("button", { name: /^Side projects\s*\d/ }).click();
    await expect(grid(page).getByRole("listitem")).toHaveCount(7);
    await filters.getByRole("button", { name: /^All( projects)?\s*\d/ }).click();
    await expect(grid(page).getByRole("listitem")).toHaveCount(21);
  });

  test("search finds projects by name, purpose or tool, and says when nothing matches", async ({ page }) => {
    await toDesk(page);
    const search = grid(page).getByRole("searchbox", { name: "Search projects" });
    await search.fill("payroll");
    await expect(card(page, "Project Payday")).toBeVisible();
    await expect(card(page, "TG Auto Trader")).toHaveCount(0);
    await search.fill("MQL5");
    await expect(card(page, "Merc SMC Pro")).toBeVisible();
    await search.fill("zzqx");
    await expect(grid(page).getByRole("listitem")).toHaveCount(0);
    await expect(grid(page).getByText(/No projects match/)).toBeVisible();
  });

  test("a service explains what it covers, lists the projects behind it, and leads to Contact", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "services sit below the grid on phones; covered by the phone test");
    await toDesk(page);
    const browse = page.locator("#desk").getByRole("complementary", { name: "Browse" });
    await browse.getByRole("button", { name: "Back-office systems" }).click();
    await expect(grid(page).getByRole("heading", { level: 2 })).toHaveText("Back-office systems");
    await expect(grid(page).getByRole("listitem").filter({ has: page.getByRole("link") })).toHaveCount(3);
    await expect(card(page, "Project Payday")).toBeVisible();
    await grid(page).getByRole("button", { name: "Talk to me about this" }).click();
    await expect(page.locator("#desk").getByRole("region", { name: "Contact" })).toBeVisible();
  });

  test("the pane holds everything: text buttons jump to sections, the story waits behind a button", async ({ page }) => {
    await toDesk(page);
    await openProject(page, "TG Auto Trader");
    const p = pane(page, "TG Auto Trader");
    for (const section of ["Screens", "Features", "Numbers", "Built with"]) {
      await expect(p.getByRole("button", { name: section, exact: true })).toBeVisible();
    }
    await p.getByRole("button", { name: "Numbers", exact: true }).click();
    await expect(p.getByRole("region", { name: "Numbers" })).toBeInViewport();
    expect(await p.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    const story = p.getByRole("button", { name: /Read the story/ });
    await expect(p.getByText("Signals arrive faster than hands")).toBeHidden();
    await story.click();
    await expect(p.getByText("Signals arrive faster than hands")).toBeVisible();
  });

  test("products with a landing page lead with a scrolling recording of it; the product demo follows", async ({ page }) => {
    await toDesk(page);
    await openProject(page, "247Aisupports");
    const p = pane(page, "247Aisupports");
    await expect(p.locator("figure video").first()).toHaveAttribute("src", /247aisupports-landing\/loop\.mp4$/);
    await expect(p.getByRole("region", { name: "Inside the product" })).toBeVisible();
  });

  test("live products link to their site; classified ones never link out", async ({ page }) => {
    await toDesk(page);
    await openProject(page, "247Aisupports");
    await expect(pane(page, "247Aisupports").getByRole("link", { name: /Visit live site/ })).toHaveAttribute("href", "https://247aisupports.com");
    await pane(page, "247Aisupports").getByRole("button", { name: "All projects" }).click();
    await openProject(page, "Project Payday");
    const payday = pane(page, "Project Payday");
    await expect(payday.getByText("Client work under NDA", { exact: false }).first()).toBeVisible();
    expect(await payday.locator("a[href^='http']").count()).toBe(0);
  });

  test("Back returns from a project to the grid; Forward opens it again", async ({ page }) => {
    await toDesk(page);
    await openProject(page, "TG Auto Trader");
    await pane(page, "TG Auto Trader").getByRole("button", { name: "All projects" }).click();
    await openProject(page, "Karaoke");
    await expect(page).toHaveURL(/\/work\/karaoke$/);
    await page.goBack();
    await expect(grid(page)).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/work\/tg-auto-trader$/);
    await expect(pane(page, "TG Auto Trader")).toBeVisible();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("each project ends with a clear way to get in touch, on the screen", async ({ page }) => {
    await toDesk(page);
    await openProject(page, "TG Auto Trader");
    const p = pane(page, "TG Auto Trader");
    await expect(p.getByText("Ask me about this build")).toHaveCount(0);
    await p.getByRole("button", { name: "Want something like this? Let's talk" }).click();
    await expect(page.locator("#desk").getByRole("region", { name: "Contact" })).toBeVisible();
    await screenNav(page).getByRole("button", { name: "All work" }).click();
    await openProject(page, "Project Payday");
    await expect(pane(page, "Project Payday").getByRole("button", { name: "Request a private walkthrough" })).toBeVisible();
  });

  test("the grid scrolls inside the monitor with the wheel", async ({ page }) => {
    await toDesk(page);
    const g = grid(page);
    const box = (await g.boundingBox())!;
    // On phones the grid is taller than the screen: aim at its visible top.
    await page.mouse.move(box.x + box.width / 2, Math.min(box.y + box.height / 2, box.y + 200));
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(600);
    // Desktop scrolls the grid itself; phones scroll the grid and the services below it together.
    expect(await g.evaluate((el) => Math.max(el.scrollTop, el.parentElement!.scrollTop))).toBeGreaterThan(0);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("the screen is light and readable", async ({ page }) => {
    await toDesk(page);
    expect(await contrast(card(page, "TG Auto Trader"))).toBeGreaterThanOrEqual(4.5);
    const browse = page.locator("#desk").getByRole("complementary", { name: "Browse" });
    if (test.info().project.name !== "phone") expect(await contrast(browse.getByRole("button", { name: /^Trading\s*\d/ }))).toBeGreaterThanOrEqual(4.5);
    const bg = await page.locator("#desk [data-screen]").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(245, 241, 234)");
  });

  test("keyboard: Tab reaches a card and Enter opens the project", async ({ page }) => {
    await toDesk(page);
    const target = card(page, "TG Auto Trader");
    for (let i = 0; i < 80 && !(await target.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(pane(page, "TG Auto Trader")).toBeVisible();
  });

  test("About and Contact open on the screen; All work returns to the grid", async ({ page }) => {
    await toDesk(page);
    const desk = page.locator("#desk");
    for (const [button, region] of [
      ["About", "About Jeon"],
      ["Contact", "Contact"],
    ] as const) {
      await screenNav(page).getByRole("button", { name: button }).click();
      await expect(desk.getByRole("region", { name: region })).toBeVisible();
      await screenNav(page).getByRole("button", { name: "All work" }).click();
      await expect(grid(page)).toBeVisible();
    }
  });

  test("Contact offers email, WhatsApp and Viber with the right links, next to Jeon's photo", async ({ page }) => {
    await toDesk(page);
    await page.locator("#desk").getByRole("navigation", { name: "Screen" }).getByRole("button", { name: "Contact" }).click();
    const c = page.locator("#desk").getByRole("region", { name: "Contact" });
    await expect(c.getByRole("heading", { name: /Let.s build something/i })).toBeVisible();
    await expect(c.getByRole("img", { name: /Loreto/ })).toBeVisible();
    await expect(c.getByRole("link", { name: /Email/ }).first()).toHaveAttribute("href", /^mailto:bertulfojeon@gmail\.com/);
    await expect(c.getByRole("link", { name: /WhatsApp/ }).first()).toHaveAttribute("href", "https://wa.me/639684333479");
    await expect(c.getByRole("link", { name: /Viber/ }).first()).toHaveAttribute("href", "viber://chat?number=%2B63474660563");
  });

  test("Get in touch on the welcome lands on the desk's Contact without the film", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Get in touch" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 5000 });
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
    await expect(page.locator("#desk").getByRole("region", { name: "Contact" })).toBeVisible();
    await expect(page.locator("#desk").getByRole("link", { name: /bertulfojeon@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
  });

  test("Pause motion switches to still mode for this visit; a new visit starts with motion on", async ({ page }, info) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Pause/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", info.project.name === "phone" ? "lite" : "full");
    await expect(page.getByRole("button", { name: /^Pause/ })).toHaveAttribute("aria-pressed", "false");
  });

  test("sound is on by default and starts with the visitor's first click", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /^Sound/ })).toHaveAttribute("aria-pressed", "true");
    const welcome = page.locator("video[src*='welcome']");
    await expect(welcome).toHaveCount(1, { timeout: 10000 });
    expect(await welcome.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true); // browsers need a gesture first
    await page.mouse.click(900, 450);
    await expect.poll(() => welcome.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
    await expect.poll(() => welcome.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the rotating line is a static sentence", async ({ page }) => {
    await page.goto("/");
    // .last(): the first match is the screen-reader copy of the same sentence.
    await expect(page.getByText("…answering your calls, placing your trades, running your payroll.").last()).toBeVisible();
  });

  test("no autoplay and no film: scrolling goes straight to the desk", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    expect(await page.locator("video").count()).toBe(0);
    await page.mouse.wheel(0, 160);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 4000 });
  });
});

test.describe("case pages", () => {
  test("open directly by URL with a way back", async ({ page }) => {
    await page.goto("/work/tg-auto-trader");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("TG Auto Trader");
    await expect(page.getByRole("link", { name: /Back to the desk/ }).first()).toBeVisible();
    await expect(page.getByText("Next screen")).toBeVisible();
  });

  test("classified files withhold identity and offer a private screening", async ({ page }) => {
    for (const slug of ["project-payday", "project-facegate", "project-balance-sheet"]) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole("complementary", { name: /withheld/ })).toBeVisible();
      await expect(page.getByRole("link", { name: "Request a private screening" })).toHaveAttribute("href", /^mailto:/);
      const external = await page.locator("main a[href^='http']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      expect(external).toEqual([]);
    }
  });

  test("direct case pages are light, with a readable top bar", async ({ page }) => {
    await page.goto("/work/tg-auto-trader");
    expect(await page.locator("main").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(245, 241, 234)");
    await expect(page.getByRole("banner")).toHaveAttribute("data-surface", "light");
  });

  test("a case leads with the business problem, then features, outcomes and credits", async ({ page }) => {
    await page.goto("/work/247aisupports");
    const main = page.getByRole("main");
    await expect(main.getByText("Calls, chats and emails come in after hours", { exact: false })).toBeVisible();
    const features = main.getByRole("region", { name: "What it does" });
    await expect(features.getByRole("listitem")).toHaveCount(14);
    await expect(main.getByRole("region", { name: "What changed" })).toBeVisible();
    await expect(main.getByRole("region", { name: "Credits" })).toContainText("Role");
  });

  test("scrolling the features moves the spotlight on the pinned screen", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "the pinned screen is a desktop layout");
    await page.goto("/work/tg-auto-trader");
    const features = page.getByRole("region", { name: "What it does" });
    const item = features.getByRole("listitem").filter({ hasText: "Custom canvas chart" });
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveAttribute("data-active", "true");
    await expect(features.locator("[data-on='true']")).toHaveCount(1);
  });

  test("side projects have their own page too", async ({ page }) => {
    await page.goto("/work/karaoke");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Karaoke");
  });

  test("an address that does not exist is a 404", async ({ page }) => {
    const res = await page.goto("/work/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nothing on this screen");
    await expect(page.getByRole("main").getByRole("link", { name: "Back to the desk" })).toHaveAttribute("href", "/");
  });
});

test.describe("final review fixes", () => {
  test("C1: the case story is readable on the light paper", async ({ page }) => {
    await page.goto("/work/tg-auto-trader");
    const para = page.getByRole("region", { name: "Behind the build" }).getByText("Retail traders who follow Telegram", { exact: false });
    expect(await contrast(para)).toBeGreaterThanOrEqual(4.5);
  });

  test("C1b: case calls to action stay readable on hover", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "hover is a pointer state");
    await page.goto("/work/project-payday");
    const cta = page.getByRole("link", { name: "Request a private screening" });
    await cta.hover();
    await page.waitForTimeout(400);
    expect(await contrast(cta)).toBeGreaterThanOrEqual(4.5);
    const next = page.getByRole("link", { name: /Next screen/ });
    await next.hover();
    await page.waitForTimeout(400);
    for (const el of await next.locator("span").all()) expect(await contrast(el)).toBeGreaterThanOrEqual(4.5);
  });

  test("I2: a scroll during a slow reload is not undone when loading finishes", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "desktop wheel path");
    await toDesk(page);
    // Hold one image so the load event comes late.
    await page.route("**/media/me/avatar-64.webp", async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 160);
    await expect(phase(page)).toHaveAttribute("data-phase", /film|desk/, { timeout: 8000 });
    await page.waitForFunction(() => document.readyState === "complete", null, { timeout: 15000 });
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.scrollY > window.innerHeight * 0.5)).toBe(true);
  });

  test("I3: on phones the screen's Contact button is on screen", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "phone layout");
    await toDesk(page);
    const contact = page.locator("#desk").getByRole("navigation", { name: "Screen" }).getByRole("button", { name: "Contact" });
    const box = (await contact.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw);
  });

  test("I4: the Contact view is not clipped on a short phone", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "phone layout");
    await page.setViewportSize({ width: 375, height: 667 });
    await toDesk(page);
    await page.locator("#desk").getByRole("navigation", { name: "Screen" }).getByRole("button", { name: "Contact" }).click();
    const region = page.locator("#desk").getByRole("region", { name: "Contact" });
    const r = (await region.boundingBox())!;
    const title = (await region.getByRole("heading").boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(r.y - 1);
    // Anything taller than the screen must be reachable by scrolling the view itself.
    const scrollable = await region.evaluate((el) => el.scrollHeight <= el.clientHeight + 1 || ["auto", "scroll"].includes(getComputedStyle(el).overflowY));
    expect(scrollable).toBe(true);
  });

  test("I5: the welcome fits under the HUD on short phones", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "phone layout");
    for (const size of [{ width: 375, height: 667 }, { width: 360, height: 640 }]) {
      await page.setViewportSize(size);
      await page.goto("/");
      await page.evaluate(() =>
        Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished)),
      );
      const hud = (await page.getByRole("banner").boundingBox())!;
      const where = (await page.getByText(/in Lapu-Lapu City/).first().boundingBox())!;
      expect(where.y, `at ${size.width}×${size.height}`).toBeGreaterThanOrEqual(hud.y + hud.height - 1);
    }
  });

  test("phones: category chips sit above a one-column grid, services follow it, and a card opens the project", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "phone layout");
    await toDesk(page);
    const grid = page.locator("#desk").getByRole("region", { name: "All work" });
    const cards = grid.getByRole("listitem");
    const [a, b] = [(await cards.nth(0).boundingBox())!, (await cards.nth(1).boundingBox())!];
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    const vw = page.viewportSize()!.width;
    expect(a.x + a.width).toBeLessThanOrEqual(vw);
    const browse = page.locator("#desk").getByRole("complementary", { name: "Browse" });
    await browse.getByRole("button", { name: "Back-office systems" }).click();
    await expect(grid.getByRole("heading", { level: 2 })).toHaveText("Back-office systems");
    await grid.getByRole("link", { name: "Project Payday", exact: true }).click();
    await expect(page.locator("#desk").getByRole("region", { name: "Project Payday" })).toBeVisible();
  });

});
