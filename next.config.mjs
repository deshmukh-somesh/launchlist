/** @type {import('next').NextConfig} */
const nextConfig = {

  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/api/auth/login",
        permanent: true
      },
      {
        source: "/sign-up",
        destination: "api/auth/register",
        permanent: true
      }
    ]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    // config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jyofbn2p1o7hap6s.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pdfaskai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pdfaskai.com',
        pathname: '/**',
      }
    ],
    domains: ['api.producthunt.com', 'pdfaskai.com', 'www.pdfaskai.com'],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
  },
};

export default nextConfig;


