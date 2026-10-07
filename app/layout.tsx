import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { CinematicProvider } from "@/features/cinematic-engine/CinematicProvider";
import { modeScript } from "@/features/cinematic-engine/mode-script";
import { Hud } from "@/components/hud/Hud";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
  display: "swap",
});
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
// Only case-study code uses it, so it is not preloaded on every page.
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false });

const SITE = "https://iamjeon.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Loreto “Jeon” Saquilabon Jr. | Full-Stack Developer & Automation Engineer",
    template: "%s | Jeon",
  },
  description:
    "Systems for businesses everywhere, built in Cebu after dark. Trading platforms, AI voice agents and SaaS, designed, engineered and shipped by one developer.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    title: "Jeon | Night Shift",
    description: "Systems for businesses everywhere, built in Cebu after dark.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Jeon on a seawall bench at night, typing on a laptop" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#05070c",
  width: "device-width",
  initialScale: 1,
  // Full-bleed on notched iPhones; the HUD and corner buttons pad themselves with the safe areas.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-mode="full"
      className={`${bigShoulders.variable} ${hanken.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Decides the viewing mode before first paint so layout never shifts. */}
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to the work
        </a>
        <CinematicProvider>
          <Hud />
          {children}
        </CinematicProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
