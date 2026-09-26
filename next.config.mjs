import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/briefcase",
  async redirects() {
    return [{ source: "/", destination: "/briefcase", basePath: false, permanent: false }];
  },
  output: "standalone",
  cleanDistDir: true,
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default withNextIntl(nextConfig);
