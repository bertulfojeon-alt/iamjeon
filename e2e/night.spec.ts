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
  test("opens on the name, visible before any scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Saquilabon");
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

test.describe("the film", () => {
  test("the first scroll plays it, holds the page, then lands on the desk", async ({ page }) => {
    await scrollIntoFilm(page);
    await expect(phase(page)).toHaveAttribute("data-phase", "film");
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 15000 });
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("Skip and Esc end it straight away", async ({ page }) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");

    // Back up to the welcome and down again: it plays again, and Esc skips.
    await page.mouse.move(20, 400);
    await page.mouse.wheel(0, -200);
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await page.mouse.wheel(0, 200);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
    await page.keyboard.press("Escape");
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("See the work goes straight to the desk", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "See the work" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 5000 });
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
  });
});

test.describe("going back to the welcome", () => {
  const atDesk = async (page: Page) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click().catch(() => {});
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  };

  test("scrolling up from the desk returns to the welcome, and down plays the film again", async ({ page }) => {
    await atDesk(page);
    await page.mouse.move(20, 400); // over the picture, not the scrollable desk grid
    await page.mouse.wheel(0, -200);
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await page.waitForTimeout(1200); // nothing pulls it back down
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(4);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();

    await page.mouse.wheel(0, 200);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("a reload starts at the welcome", async ({ page }) => {
    await atDesk(page);
    await page.reload();
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await topOfPage(page);
    await page.waitForTimeout(800);
    await expect(phase(page)).toHaveAttribute("data-phase", "welcome");
    await page.mouse.wheel(0, 160);
    await expect(phase(page)).toHaveAttribute("data-phase", "film", { timeout: 8000 });
  });
});

test.describe("the desk", () => {
  test("the work is grouped by business problem and every case study opens as a scene", async ({ page }) => {
    await toDesk(page);
    const menu = page.locator("#desk").getByRole("navigation", { name: "Work by business problem" });
    for (const group of ["Calls & messages", "Trading", "Admin & back-office", "More work"]) {
      await expect(menu.getByRole("heading", { name: group })).toBeVisible();
    }
    const buttons = menu.getByRole("button");
    expect(await buttons.count()).toBe(14);
    await buttons.filter({ hasText: "TG Auto Trader" }).click();
    const scene = page.locator("#desk").getByRole("article", { name: "TG Auto Trader" });
    await expect(scene).toBeVisible();
    await expect(scene.getByRole("link", { name: "How does it work?" })).toHaveAttribute("href", "/work/tg-auto-trader");
    await scene.getByRole("button", { name: "Another example" }).click();
    await expect(page.locator("#desk").getByRole("article")).not.toHaveAccessibleName("TG Auto Trader");
    await page.locator("#desk").getByRole("button", { name: "All work" }).first().click();
    await expect(menu).toBeVisible();
  });

  test("the screen is light and readable", async ({ page }) => {
    await toDesk(page);
    const heading = page.locator("#desk").getByRole("heading", { name: "Trading" });
    expect(await contrast(heading)).toBeGreaterThanOrEqual(4.5);
    const bg = await page.locator("#desk [data-screen]").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(245, 241, 234)");
  });

  test("the menu and a scene fit the monitor without scrolling", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "the phone layout is a scrolling panel");
    for (const size of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(size);
      await toDesk(page);
      const view = page.locator("#desk [data-screen-view]");
      expect(await view.evaluate((el) => el.scrollHeight <= el.clientHeight + 1), `menu at ${size.width}`).toBe(true);
      await page.locator("#desk").getByRole("button", { name: /^247Aisupports/ }).click();
      expect(await view.evaluate((el) => el.scrollHeight <= el.clientHeight + 1), `scene at ${size.width}`).toBe(true);
    }
  });

  test("keyboard: Tab reaches the menu, Enter opens a scene and its case", async ({ page }) => {
    await toDesk(page);
    const first = page.locator("#desk").getByRole("navigation", { name: "Work by business problem" }).getByRole("button").first();
    for (let i = 0; i < 40 && !(await first.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("Enter");
    const how = page.locator("#desk").getByRole("link", { name: "How does it work?" });
    await expect(how).toBeVisible();
    await how.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\//);
  });

  test("a case opens full-screen and light, with its own address, and closes back to the scene", async ({ page }) => {
    await toDesk(page);
    await page.locator("#desk").getByRole("button", { name: /^TG Auto Trader/ }).click();
    await page.locator("#desk").getByRole("link", { name: "How does it work?" }).click();
    await expect(page).toHaveURL(/\/work\/tg-auto-trader$/);
    const dialog = page.getByRole("dialog", { name: "TG Auto Trader" });
    await expect(dialog).toBeVisible();
    await dialog.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const box = await dialog.boundingBox();
    const vp = page.viewportSize()!;
    expect(box!.width).toBeGreaterThanOrEqual(vp.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1);
    // The frame around the scrolling body carries the light paper colour.
    expect(await dialog.evaluate((el) => getComputedStyle(el.querySelector("[data-modal-body]")!.parentElement!).backgroundColor)).toBe("rgb(245, 241, 234)");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#desk").getByRole("article", { name: "TG Auto Trader" })).toBeVisible();
  });

  test("browser Back from a case returns to the same scene", async ({ page }) => {
    await toDesk(page);
    await page.locator("#desk").getByRole("button", { name: /^247Aisupports/ }).click();
    await page.locator("#desk").getByRole("link", { name: "How does it work?" }).click();
    await expect(page.getByRole("dialog", { name: "247Aisupports" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
    await expect(page.locator("#desk").getByRole("article", { name: "247Aisupports" })).toBeVisible();
  });

  test("About, Side projects and Contact open on the screen and return to the work", async ({ page }) => {
    await toDesk(page);
    const desk = page.locator("#desk");
    for (const [button, region] of [
      ["About", "About Jeon"],
      ["Side projects", "Side projects"],
      ["Contact", "Contact"],
    ] as const) {
      await desk.getByRole("navigation", { name: "Screen" }).getByRole("button", { name: button }).click();
      await expect(desk.getByRole("region", { name: region })).toBeVisible();
      await desk.getByRole("button", { name: "All work" }).first().click();
      await expect(desk.getByRole("navigation", { name: "Work by business problem" })).toBeVisible();
    }
  });

  test("Get in touch on the welcome lands on the desk's Contact without the film", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Get in touch" }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 5000 });
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
    await expect(page.locator("#desk").getByRole("region", { name: "Contact" })).toBeVisible();
    await expect(page.locator("#desk").getByRole("link", { name: /bertulfojeon@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
  });

  test("Pause motion switches to still mode and is remembered", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Pause/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    await page.getByRole("button", { name: /^Play/ }).click();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

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

  test("archive projects have no case page", async ({ page }) => {
    const res = await page.goto("/work/karaoke");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nothing on this screen");
    await expect(page.getByRole("main").getByRole("link", { name: "Back to the desk" })).toHaveAttribute("href", "/");
  });
});
