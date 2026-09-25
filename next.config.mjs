/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/Shop%20Now',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/Shop Now',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
