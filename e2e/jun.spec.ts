import { expect, test, type Page } from "@playwright/test";
import { mockLive, stubMic } from "./jun-mock";

const phase = (page: Page) => page.locator("section[data-phase]");
const badge = (page: Page) => page.locator("[data-jun-badge]");

/** A wheel turn; mobile WebKit has no wheel, so there the page scrolls the way a swipe moves it. */
async function wheel(page: Page, dy: number) {
  try {
    await page.mouse.wheel(0, dy);
  } catch {
    await page.evaluate((d) => window.scrollBy(0, d), dy);
  }
}

/** The desk without the film: the HUD's "Work" skips it; phones skip the film. */
async function toDesk(page: Page) {
  await page.goto("/");
  const work = page.getByRole("button", { name: "Work", exact: true });
  if (await work.isVisible()) await work.click();
  else {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await wheel(page, 160);
    await page.getByRole("button", { name: "Skip" }).click({ timeout: 8000 }).catch(() => {});
  }
  await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 8000 });
}

type Item = { slug: string; title: string; spotlights: { feature: string; label: string }[]; metrics: { value: string }[] };
async function items(page: Page): Promise<Item[]> {
  return (await page.request.get("/api/jun/items")).json();
}

test.describe("where Jun appears", () => {
  test("never on the welcome or during the film; at the desk and on project pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(badge(page)).toHaveCount(0);
    await wheel(page, 160);
    await expect(phase(page)).toHaveAttribute("data-phase", /film|desk/, { timeout: 8000 });
    if ((await phase(page).getAttribute("data-phase")) === "film") await expect(badge(page)).toHaveCount(0);
    await toDesk(page);
    await expect(badge(page)).toHaveCount(1);
    await page.goto("/work/tradesbymerc");
    await expect(badge(page)).toHaveCount(1);
  });
});

test.describe("the badge's geometry", () => {
  test.beforeEach(() => test.skip(test.info().project.name !== "desktop", "sizes are set per test; one engine is enough"));

  for (const width of [1280, 430, 390, 375, 360]) {
    test(`fits at ${width} px, resting and waving`, async ({ browser }) => {
      const mobile = width < 600;
      const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage();
      await toDesk(page);
      const measure = () =>
        page.evaluate(() => {
          const r = (el: Element) => el.getBoundingClientRect();
          const ring = r(document.querySelector("[data-ring-front]")!);
          const pill = r(document.querySelector("[data-jun-pill]")!);
          const up = r(document.querySelector('[aria-label="Back to the top"]')!);
          return { ring: [ring.left, ring.right], pill: [pill.left, pill.right], upRight: up.right, sw: document.documentElement.scrollWidth, iw: innerWidth };
        });
      const check = async (state: string) => {
        const m = await measure();
        expect(m.pill[0], `${state}: pill inside the ring (left)`).toBeGreaterThanOrEqual(m.ring[0] - 0.5);
        expect(m.pill[1], `${state}: pill inside the ring (right)`).toBeLessThanOrEqual(m.ring[1] + 0.5);
        expect(m.ring[0], `${state}: ring on screen`).toBeGreaterThanOrEqual(0);
        expect(m.ring[1], `${state}: ring on screen`).toBeLessThanOrEqual(m.iw);
        expect(m.ring[0] - m.upRight, `${state}: clear of the ↑ button`).toBeGreaterThanOrEqual(12);
        expect(m.sw, `${state}: no sideways scroll`).toBe(m.iw);
      };
      await page.waitForTimeout(800);
      await check("resting");
      await expect(badge(page)).toHaveAttribute("data-up", "true", { timeout: 9000 });
      await page.waitForTimeout(800); // the rise and the growth finish
      await check("waving");
      await context.close();
    });
  }
});

test.describe("the wave", () => {
  test("rises a few seconds after the desk appears, and sinks back after the clip", async ({ page }) => {
    await toDesk(page);
    await expect(badge(page)).toHaveAttribute("data-up", "false");
    await expect(badge(page)).toHaveAttribute("data-up", "true", { timeout: 9000 });
    await expect(badge(page)).toHaveAttribute("data-up", "false", { timeout: 9000 });
  });

  test("never moves in still mode", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Work", exact: true }).click();
    await expect(phase(page)).toHaveAttribute("data-phase", "desk", { timeout: 8000 });
    await expect(badge(page)).toHaveAttribute("data-still", "true");
    await page.waitForTimeout(6500);
    await expect(badge(page)).toHaveAttribute("data-up", "false");
    await expect(page.locator("[data-jun-badge] video")).toHaveCount(0);
    await context.close();
  });
});

test.describe("starting a call", () => {
  test("Not now closes the card", async ({ page }) => {
    await toDesk(page);
    await badge(page).locator("[data-jun-pill]").click();
    await expect(page.locator("[data-jun-card=intro]")).toBeVisible();
    await page.getByRole("button", { name: "Not now" }).click();
    await expect(page.locator("[data-jun-card]")).toHaveCount(0);
  });

  for (const mode of ["denied", "missing"] as const) {
    test(`a ${mode} microphone explains and offers contact`, async ({ page, browserName }) => {
      await stubMic(page, mode);
      const live = await mockLive(page);
      await toDesk(page);
      await badge(page).locator("[data-jun-pill]").click();
      await page.getByRole("button", { name: "Start" }).click();
      // Playwright's WebKit on Windows has no Web Audio at all: there the call cannot start,
      // and the visitor is told the browser cannot hold a call (real Safari has Web Audio).
      const noWebAudio = browserName === "webkit" && !(await page.evaluate(() => "AudioContext" in window || "webkitAudioContext" in window));
      await expect(page.locator(`[data-jun-failure=${noWebAudio ? "unsupported" : mode}]`)).toBeVisible();
      await expect(page.locator("[data-jun-card=error] [data-jun-links] a")).toHaveCount(3);
      expect(live.tokenRequests).toHaveLength(0);
    });
  }
});

test.describe("a call with Jun (mock Live service)", () => {
  test.skip(({ browserName }) => browserName === "webkit", "the mock socket and silent mic run on Chromium");

  test("talks, presents, steers the desk and hands over to contact", async ({ page }) => {
    await stubMic(page, "ok");
    const live = await mockLive(page);
    await toDesk(page);
    const list = await items(page);
    const p = list.find((i) => i.spotlights.length && i.metrics.length)!;

    await badge(page).locator("[data-jun-pill]").click();
    await page.getByRole("button", { name: "Start" }).click();
    await expect.poll(() => live.tokenRequests.map((r) => r.model)).toEqual(["primary"]);
    await expect(page.locator("[data-jun-card=call]")).toBeVisible();
    await expect(page.locator("[data-status=listening]")).toBeVisible({ timeout: 10000 });

    live.say("Hi, I'm Jun, Jeon's AI twin.");
    await expect(page.locator("[data-jun-subtitle]")).toHaveText("Hi, I'm Jun, Jeon's AI twin.");

    // A slide before the stage is open is refused, and nothing opens.
    live.call("show_slide", { kind: "hero", slug: p.slug });
    await expect.poll(() => live.toolResponses.at(-1)?.response.error).toBeTruthy();
    await expect(page.getByRole("dialog", { name: "Jun's presentation" })).toHaveCount(0);

    // Jun only offers the big screen; the visitor opens it with a tap.
    live.call("start_presentation");
    const stage = page.getByRole("dialog", { name: "Jun's presentation" });
    await expect(page.locator("[data-jun-offer]")).toBeVisible();
    await expect(stage).toHaveCount(0);
    await page.getByRole("button", { name: "Show me on the big screen" }).click();
    await expect(stage).toBeVisible();
    await expect(page.locator("[data-jun-offer]")).toHaveCount(0);
    // The stage covers everything, the site's top bar included.
    const topmost = await page.evaluate(() => {
      const close = [...document.querySelectorAll(`[aria-label="Jun's presentation"] button`)].find((b) => b.textContent === "Close")!;
      const r = close.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const who = document.querySelector(`[aria-label="Jun's presentation"] header span`)!.getBoundingClientRect();
      const hit2 = document.elementFromPoint(who.left + 4, who.top + who.height / 2);
      return [close.contains(hit), !!hit2?.closest(`[aria-label="Jun's presentation"]`)];
    });
    expect(topmost).toEqual([true, true]);

    live.call("show_slide", { kind: "hero", slug: p.slug });
    await expect(stage.getByRole("heading", { name: p.title })).toBeVisible();

    live.call("show_slide", { kind: "feature", slug: p.slug, feature: p.spotlights[0].feature });
    await expect(stage.locator("[data-jun-feature]")).toHaveText(p.spotlights[0].label);

    live.call("show_slide", { kind: "numbers", slug: p.slug });
    await expect(stage.getByText(p.metrics[0].value, { exact: true })).toBeVisible();

    // An unknown project: an error goes back and the slide stays.
    const before = live.toolResponses.length;
    live.call("show_slide", { kind: "hero", slug: "no-such-project" });
    await expect.poll(() => live.toolResponses.length).toBe(before + 1);
    expect(live.toolResponses.at(-1)?.response.error).toBeTruthy();
    await expect(stage.locator("[data-slide-kind=numbers]")).toBeVisible();

    live.call("end_presentation");
    await expect(stage).toHaveCount(0);

    live.call("open_project", { slug: p.slug });
    await expect(page).toHaveURL(new RegExp(`/work/${p.slug}$`));

    live.call("open_contact", { summary: "Runs a clinic and needs calls answered after hours.", channel: "whatsapp" });
    await expect(page.locator("section[aria-label=Contact] [data-jun-note]")).toContainText("Runs a clinic");
    const wa = page.locator('section[aria-label=Contact] a[href^="https://wa.me/"]').first();
    await expect(wa).toHaveAttribute("href", /text=Runs%20a%20clinic/);

    // Ending the call frees the microphone.
    await page.locator("[data-jun-card=call]").getByRole("button", { name: "End" }).click();
    await expect(page.locator("[data-jun-card=after]")).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __junTracks: MediaStreamTrack[] }).__junTracks.map((t) => t.readyState))).toEqual(["ended"]);
  });

  test("a quota refusal retries once on the fallback model", async ({ page }) => {
    await stubMic(page, "ok");
    const live = await mockLive(page, { refuse: 1 });
    await toDesk(page);
    await badge(page).locator("[data-jun-pill]").click();
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.locator("[data-status=listening]")).toBeVisible({ timeout: 10000 });
    expect(live.tokenRequests.map((r) => r.model)).toEqual(["primary", "fallback"]);
  });

  test("when both models are refused, the line is busy and contact is offered", async ({ page }) => {
    await stubMic(page, "ok");
    const live = await mockLive(page, { refuse: 2 });
    await toDesk(page);
    await badge(page).locator("[data-jun-pill]").click();
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.locator("[data-jun-failure=busy]")).toBeVisible({ timeout: 10000 });
    expect(live.tokenRequests.map((r) => r.model)).toEqual(["primary", "fallback"]);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __junTracks: MediaStreamTrack[] }).__junTracks.every((t) => t.readyState === "ended"))).toBe(true);
  });
});
