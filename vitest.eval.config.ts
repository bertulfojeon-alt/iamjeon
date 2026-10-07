import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** `npm run jun:eval`: Jun's live eval only, kept out of `npm test` (it calls the real model). */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { environment: "node", include: ["scripts/jun-eval.ts"] },
});
