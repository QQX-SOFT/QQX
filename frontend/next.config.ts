import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true, // Prevent build failure due to TS lints during rapid development
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
