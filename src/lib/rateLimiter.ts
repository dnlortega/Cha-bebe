// src/lib/rateLimiter.ts
import { RateLimiter } from 'next-rate-limit';

/**
 * Simple IP‑based rate limiter.
 * Allows a maximum of 30 requests per minute per IP address.
 * Adjust `interval` and `max` according to your traffic needs.
 */
export const limiter = RateLimiter({
  interval: 60, // seconds
  max: 30,
  // mensagem padrão quando o limite for ultrapassado
  message: { error: 'Muitas requisições – tente novamente em um minuto.' },
});
