/**
 * Jeon's public contact channels and the links that carry a visitor's note to him.
 * Jun writes the note (a summary of what the visitor said); the visitor always sees
 * it before sending. Viber links cannot pre-fill a message, so the caller copies it.
 */

export const EMAIL = "bertulfojeon@gmail.com";
export const WHATSAPP = { label: "+63 968 4333 479", number: "639684333479" };
export const VIBER = { label: "+63474660563", number: "+63474660563" };

const MAX_SUMMARY = 500;

/** One line of plain text, at most 500 characters, cut on a word boundary. */
export function clampSummary(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= MAX_SUMMARY) return flat;
  const cut = flat.slice(0, MAX_SUMMARY - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export function mailtoHref(summary = ""): string {
  const body = clampSummary(summary);
  return `mailto:${EMAIL}?subject=Project%20enquiry${body ? `&body=${encodeURIComponent(body)}` : ""}`;
}

export function whatsappHref(summary = ""): string {
  const text = clampSummary(summary);
  return `https://wa.me/${WHATSAPP.number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function viberHref(): string {
  return `viber://chat?number=${encodeURIComponent(VIBER.number)}`;
}
