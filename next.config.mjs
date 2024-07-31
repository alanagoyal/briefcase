import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cleanDistDir: true,
  outputFileTracingRoot: path.join(fileURLToPath(import.meta.url), './'),
  cacheMaxMemorySize: 0, // disable default in-memory caching
  
};

export default nextConfig;
