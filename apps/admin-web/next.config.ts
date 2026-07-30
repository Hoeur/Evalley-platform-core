import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@platform/ecommerce-core", "@platform/crm-core"],
};

export default nextConfig;
