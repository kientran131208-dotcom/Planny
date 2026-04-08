import type { NextConfig } from "next";

// Triggering full dev server refresh - 2026-04-05
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
