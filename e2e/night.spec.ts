import { expect, test, type Page } from "@playwright/test";

const phase = (page: Page) => page.locator("section[data-phase]");

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

    // Seen once this visit: a new tab replays it, and Esc skips.
    const fresh = await page.context().newPage();
    await fresh.evaluate(() => sessionStorage.clear()).catch(() => {});
    await scrollIntoFilm(fresh);
    await fresh.keyboard.press("Escape");
    await expect(phase(fresh)).toHaveAttribute("data-phase", "desk");
  });
});

test.describe("the desk", () => {
  test("every case study is reachable from its tabs", async ({ page }) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click().catch(() => {});
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
    const tabs = page.locator("#desk").getByRole("tab");
    const hrefs = new Set<string>();
    for (let i = 0; i < (await tabs.count()); i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
      for (const a of await page.locator('#desk a[href^="/work/"]').all()) hrefs.add((await a.getAttribute("href"))!);
    }
    expect(hrefs.size).toBe(14);
  });

  test("a project opens in a modal with its own address, and closes back to the desk", async ({ page }) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click().catch(() => {});
    await page.locator('#desk a[href="/work/tg-auto-trader"]').click();
    await expect(page).toHaveURL(/\/work\/tg-auto-trader$/);
    const dialog = page.getByRole("dialog", { name: "TG Auto Trader" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 1 })).toHaveText("TG Auto Trader");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(phase(page)).toHaveAttribute("data-phase", "desk");
  });

  test("About, Side projects and Contact open from the dock", async ({ page }) => {
    await scrollIntoFilm(page);
    await page.getByRole("button", { name: "Skip" }).click().catch(() => {});
    for (const [button, dialog] of [
      [/^About/, "About Jeon"],
      [/^Side projects/, "Side projects"],
      [/^Contact/, "Contact"],
    ] as const) {
      await page.locator("#desk").getByRole("button", { name: button }).click();
      await expect(page.getByRole("dialog", { name: dialog })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog", { name: dialog })).toBeHidden();
    }
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

  test("archive projects have no case page", async ({ page }) => {
    const res = await page.goto("/work/karaoke");
    expect(res?.status()).toBe(404);
  });
});
