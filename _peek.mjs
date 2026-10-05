import { chromium } from "@playwright/test";
import sharp from "sharp";
const urls = process.argv.slice(2);
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const tiles = [];
for (const u of urls) {
  const p = await ctx.newPage();
  await p.goto(u, { waitUntil: "networkidle", timeout: 90000 }).catch((e) => console.log("timeout", u));
  await p.waitForTimeout(2500);
  tiles.push(await sharp(await p.screenshot()).resize(480, 300).png().toBuffer());
  console.log("ok", u, await p.title());
  await p.close();
}
const cols = 3;
await sharp({ create: { width: cols * 480, height: Math.ceil(tiles.length / cols) * 300, channels: 3, background: "#000" } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 480, top: Math.floor(i / cols) * 300 }))).png().toFile(process.env.TEMP + "/shots/peek.png");
await b.close();
