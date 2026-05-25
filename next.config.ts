import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: staticExport ? "export" : "standalone",
  trailingSlash: staticExport ? true : undefined,
  images: {
    unoptimized: staticExport,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480, 560, 640, 828],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "sunblinds.cz",
      },
    ],
  },
};

export default nextConfig;
