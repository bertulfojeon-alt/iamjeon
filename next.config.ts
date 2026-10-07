import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // Jun's token route reads the résumé from disk; make sure the deployment carries it.
  outputFileTracingIncludes: { "/api/jun/token": ["./content/resume.md"] },
  // Media files keep their names when they are re-recorded, so they are cached for a day
  // (and refreshed in the background for a week) rather than forever.
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
