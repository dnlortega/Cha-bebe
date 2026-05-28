// src/lib/rateLimiter.ts
import { rateLimit } from '@daveyplate/next-rate-limit';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Simple IP‑based rate limiter.
 * Allows a maximum of 30 requests per 60‑second window per IP address.
 * Adjust `ipLimit` and `ipWindow` according to your traffic needs.
 */
export async function applyRateLimit(request: NextRequest, response: NextResponse) {
  return rateLimit({
    request,
    response,
    ipLimit: 30,
    ipWindow: 60, // seconds
  });
}
