import { expect, test, type Page } from "@playwright/test";

/**
 * The first two sections (the welcome and the desk) on the screens people use:
 * phones (portrait and landscape), iPads, laptops, MacBooks and large desktops.
 * Runs in Chromium ("desktop" project) and WebKit/Safari ("mac-safari" project).
 */
const DEVICES = [
  { name: "iPhone SE (1st gen)", width: 320, height: 568, touch: true },
  { name: "iPhone SE", width: 375, height: 667, touch: true },
  { name: "iPhone 15", width: 393, height: 852, touch: true },
  { name: "iPhone 15 Pro Max", width: 430, height: 932, touch: true },
  { name: "Android phone", width: 360, height: 800, touch: true },
  { name: "iPhone landscape", width: 852, height: 393, touch: true },
  { name: "small phone landscape", width: 667, height: 375, touch: true },
  { name: "iPad mini", width: 768, height: 1024, touch: true },
  { name: "iPad Air", width: 820, height: 1180, touch: true },
  { name: "iPad landscape", width: 1180, height: 820, touch: true },
  { name: "iPad Pro landscape", width: 1366, height: 1024, touch: true },
  { name: "laptop 1280×720", width: 1280, height: 720, touch: false },
  { name: "laptop 1366×768", width: 1366, height: 768, touch: false },
  { name: "MacBook Air", width: 1470, height: 956, touch: false },
  { name: "MacBook Pro 16", width: 1728, height: 1117, touch: false },
  { name: "desktop 1920×1080", width: 1920, height: 1080, touch: false },
  { name: "desktop 2560×1440", width: 2560, height: 1440, touch: false },
];

const phase = (page: Page) => page.locator("section[data-phase]");

/** True when the element's centre is not covered by anything else. */
function reachable(locator: ReturnType<Page["locator"]>) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (hit === el || el.contains(hit));
  });
}

async function toDesk(page: Page) {
  const work = page.getByRole("button", { name: "Work", exact: true });
  if (await work.isVisible()) await work.click();
  else {
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.getByRole("button", { name: "Skip" }).click({ timeout: 8000 }).catch(() => {});
  }
  await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 10000 });
}

for (const d of DEVICES) {
  test.describe(d.name, () => {
    test.use({ viewport: { width: d.width, height: d.height }, isMobile: d.touch, hasTouch: d.touch });

    test(`welcome and desk work at ${d.width}×${d.height}`, async ({ page }, info) => {
      test.skip(/phone/.test(info.project.name), "the device list sets its own viewports");
      await page.goto("/");
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      await page.evaluate(() =>
        Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished)),
      );

      // ── Section 1: the welcome ──
      const size = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
      expect(size.sw, "no sideways scroll").toBeLessThanOrEqual(size.w);
      const hud = (await page.getByRole("banner").boundingBox())!;
      const title = (await h1.boundingBox())!;
      expect(title.y, "headline clears the top bar").toBeGreaterThanOrEqual(hud.y + hud.height - 1);
      expect(title.x).toBeGreaterThanOrEqual(0);
      expect(title.x + title.width).toBeLessThanOrEqual(d.width + 1);
      const cta = page.getByRole("button", { name: "See what I'd build for you" });
      await expect(cta).toBeInViewport({ ratio: 1 });
      expect(await reachable(cta), "the main button is not covered").toBe(true);

      // ── Section 2: the desk ──
      await toDesk(page);
      const screen = page.locator("#desk [data-screen]");
      await expect(screen).toBeVisible();
      const box = (await screen.boundingBox())!;
      expect(box.x, "screen inside the viewport").toBeGreaterThanOrEqual(-2);
      expect(box.y).toBeGreaterThanOrEqual(-2);
      expect(box.x + box.width).toBeLessThanOrEqual(d.width + 2);
      expect(box.y + box.height).toBeLessThanOrEqual(d.height + 2);
      // Readable: the projected screen is never shrunk so far that its text turns to dust.
      const scale = await screen.evaluate((el) => el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth);
      expect(scale, "screen scale").toBeGreaterThanOrEqual(0.6);
      expect(box.height, "enough screen to work with").toBeGreaterThanOrEqual(Math.min(300, d.height * 0.55));
      // Back to the top sits clear of the screen.
      const top = (await page.getByRole("button", { name: "Back to the top" }).boundingBox())!;
      expect(top.y + top.height <= box.y + 1 || top.y >= box.y + box.height - 1, "↑ clear of the screen").toBe(true);
      expect(top.y + top.height).toBeLessThanOrEqual(d.height);

      // A project opens and its pane is on screen.
      const grid = page.locator("#desk").getByRole("region", { name: "All work" });
      await grid.getByRole("link", { name: "TG Auto Trader", exact: true }).click();
      await expect(page.locator("#desk").getByRole("region", { name: "TG Auto Trader" })).toBeVisible();
      const after = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
      expect(after.sw, "no sideways scroll at the desk").toBeLessThanOrEqual(after.w);
    });
  });
}
