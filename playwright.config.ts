import { defineConfig } from "@playwright/test";

/**
 * End-to-end checks against the production build (`npm run build` first).
 * Uses the system Edge/Chrome channel so no browser download is needed.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3737",
    channel: process.env.PW_CHANNEL ?? "msedge",
    // Muted autoplay is allowed in real browsers; make headless behave the same.
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
  },
  webServer: {
    command: "npx next start -p 3737",
    url: "http://localhost:3737",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
