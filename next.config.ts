import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 한글 디렉토리명으로 인한 Turbopack 인코딩 버그 우회
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
