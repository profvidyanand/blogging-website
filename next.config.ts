import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.106"],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "query", key: "q" }],
        destination: "/search?q=:q",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
