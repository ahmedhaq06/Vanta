import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests } = config;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      // Create new rate limit window
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + interval,
      });
      return null; // Allow request
    }

    if (record.count >= maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Increment counter
    record.count++;
    return null; // Allow request
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  });
}, 60000); // Cleanup every minute
