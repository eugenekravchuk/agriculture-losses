/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // anything starting with /api/
        destination: "https://agriculture-losses-1llp.onrender.com/:path*", // goes to FastAPI backend
      },
    ];
  },
};

export default nextConfig;
