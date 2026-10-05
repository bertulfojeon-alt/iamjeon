import { expect, test } from "@playwright/test";

test.describe("the night", () => {
  test("opens on the name, visible before any scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Saquilabon");
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

  test("every case study is reachable from the work index", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const tabs = page.getByRole("group", { name: "Chapters" }).getByRole("button");
    const hrefs = new Set<string>();
    if ((await tabs.count()) > 0) {
      // Full mode: step through every chapter of the monitor wall.
      for (let i = 0; i < (await tabs.count()); i++) {
        await tabs.nth(i).click();
        await expect(tabs.nth(i)).toHaveAttribute("aria-pressed", "true");
        for (const a of await page.locator('#work a[href^="/work/"]').all()) hrefs.add((await a.getAttribute("href"))!);
      }
    } else {
      for (const a of await page.locator('#work a[href^="/work/"]').all()) hrefs.add((await a.getAttribute("href"))!);
    }
    expect(hrefs.size).toBe(15);
  });

  test("Pause motion switches to still mode and is remembered", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Pause motion" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    await page.getByRole("button", { name: "Play motion" }).click();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("tells the same story without pinning or scrubbing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "still");
    // Every overlay is readable, and no scene is pinned.
    await expect(page.getByText("Systems for businesses everywhere")).toBeVisible();
    const sticky = await page.evaluate(() =>
      [...document.querySelectorAll(".scene-stage")].filter((el) => getComputedStyle(el).position === "sticky").length,
    );
    expect(sticky).toBe(0);
  });
});

test.describe("case studies", () => {
  test("opens directly by URL with a way back", async ({ page }) => {
    await page.goto("/work/tg-auto-trader");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("TG Auto Trader");
    await expect(page.getByRole("link", { name: /Back to the wall/ })).toBeVisible();
    await expect(page.getByText("Next screen")).toBeVisible();
  });

  test("classified files withhold identity and offer a private screening", async ({ page }) => {
    for (const slug of ["project-payday", "project-facegate", "project-balance-sheet"]) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole("complementary", { name: /withheld/ })).toBeVisible();
      await expect(page.getByRole("link", { name: "Request a private screening" })).toHaveAttribute("href", /^mailto:/);
      // No outbound links on a classified page, other than mail.
      const external = await page
        .locator("main a[href^='http']")
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      expect(external).toEqual([]);
    }
  });

  test("archive projects have no case page", async ({ page }) => {
    const res = await page.goto("/work/karaoke");
    expect(res?.status()).toBe(404);
  });
});
