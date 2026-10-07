/**
 * The project list Jun answers from, for the /work pages. The desk already carries it
 * in the page; a /work page must not (a classified case page may not contain the names
 * on the classified-only list, and the full list has public projects that use them), so
 * Jun fetches it here when the visitor opens the call card. Built once, at build time.
 */

import { screenItems } from "@/content/screen-items";

export const dynamic = "force-static";

export function GET() {
  return Response.json(screenItems());
}
