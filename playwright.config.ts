import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks against the production build (`npm run build` first).
 * Chromium runs on the system Edge/Chrome channel. Safari is covered by Playwright's
 * WebKit (`npx playwright install webkit`): an iPhone and a MacBook.
 */
const chromium = {
  channel: process.env.PW_CHANNEL ?? "msedge",
  // Muted autoplay is allowed in real browsers; make headless behave the same.
  launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
};

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3737",
  },
  webServer: {
    command: "npx next start -p 3737",
    url: "http://localhost:3737",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "desktop", use: { ...chromium, viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...chromium, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "iphone", use: { ...devices["iPhone 15"] } },
    { name: "mac-safari", use: { browserName: "webkit", viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2 } },
  ],
});
