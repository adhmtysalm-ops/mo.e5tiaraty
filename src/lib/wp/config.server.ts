import { env } from "@/lib/env.server";

export const WP_ORIGIN = "https://mo.e5tiaraty.com";
export const WP_API = `${WP_ORIGIN}/wp-json`;
export const LOCAL_LOGO = "/logo.webp";

export function wpAuthHeader(): string | undefined {
  const user = env("WP_USER") ?? "e5tiaraty.com";
  const pass = env("WP_APP_PASSWORD") ?? "vq2D RGdr Wtuh bbCj bYtp B6cI";
  if (!user || !pass) return undefined;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}
