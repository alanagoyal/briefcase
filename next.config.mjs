import path from "node:path";
import { createRequire } from "node:module";
import createNextIntlPlugin from 'next-intl/plugin';

const require = createRequire(import.meta.url);
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cleanDistDir: true,
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default withNextIntl(nextConfig);