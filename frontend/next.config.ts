import type { NextConfig } from "next";
import * as fs from "fs";
import * as path from "path";

// Load NEXT_PUBLIC_* vars from the root .env if not already in the environment
const rootEnvPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(rootEnvPath)) {
  const lines = fs.readFileSync(rootEnvPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key.startsWith("NEXT_PUBLIC_") && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
