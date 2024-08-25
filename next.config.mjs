import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: "edge",
  },
  output: "standalone",
  cleanDistDir: true,
  cacheMaxMemorySize: 0, // disable default in-memory caching
  
};

export default nextConfig;
