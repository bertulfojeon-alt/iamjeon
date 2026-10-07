import { describe, expect, it } from "vitest";
import { clampSummary, mailtoHref, viberHref, whatsappHref } from "./contact";

describe("contact links", () => {
  it("puts the summary in the email body, encoded", () => {
    expect(mailtoHref("Hi & hello")).toBe("mailto:bertulfojeon@gmail.com?subject=Project%20enquiry&body=Hi%20%26%20hello");
  });

  it("pre-fills WhatsApp with the summary", () => {
    expect(whatsappHref("a b")).toBe("https://wa.me/639684333479?text=a%20b");
  });

  it("leaves the body and text out when there is no summary", () => {
    expect(mailtoHref()).toBe("mailto:bertulfojeon@gmail.com?subject=Project%20enquiry");
    expect(whatsappHref("   ")).toBe("https://wa.me/639684333479");
  });

  it("opens a Viber chat with the number (Viber cannot pre-fill a message)", () => {
    expect(viberHref()).toBe("viber://chat?number=%2B63474660563");
  });
});

describe("clampSummary", () => {
  it("collapses whitespace and trims", () => {
    expect(clampSummary("  a\n\n b\t c ")).toBe("a b c");
  });

  it("returns an empty string for nothing", () => {
    expect(clampSummary("   ")).toBe("");
  });

  it("caps long summaries at 500 characters on a word boundary", () => {
    const long = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
    const out = clampSummary(long);
    expect(out.length).toBeLessThanOrEqual(500);
    expect(out.endsWith("…")).toBe(true);
    const words = out.slice(0, -1).trim().split(" ");
    expect(long.split(" ")).toContain(words[words.length - 1]);
  });
});
