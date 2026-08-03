import { NextResponse } from "next/server";

type RateLimitStore = Map<string, { count: number; resetAt: number }>;

const store: RateLimitStore = new Map();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: In production with multiple instances, use a shared store such as
 * Upstash Redis. Configure UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * to enable it.
 */
export async function rateLimit(req: Request, { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}) {
  const ip = getClientIp(req);
  const key = ip;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }

  return null;
}
