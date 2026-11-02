import type { NextConfig } from "next"
import { corsHeaders } from "./lib/cors"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/cloudinary/:path*",
        headers: Object.entries(corsHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ]
  },
}

export default nextConfig