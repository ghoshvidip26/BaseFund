/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yellow-immediate-swift-288.mypinata.cloud",
        port: "", // leave empty if default
        pathname: "/**", // match all paths
      },
    ],
  },
};

export default nextConfig;
