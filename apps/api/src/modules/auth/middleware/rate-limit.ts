import type { FastifyRequest, FastifyReply } from 'fastify';
import { RateLimitError } from '../../../lib/errors';

// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = `${options.keyPrefix || 'rl'}:${request.ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return;
    }

    record.count++;

    if (record.count > options.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      reply.header('Retry-After', retryAfter);
      throw new RateLimitError(
        `Too many requests. Please try again in ${retryAfter} seconds.`
      );
    }
  };
}

// Predefined rate limiters for auth routes
export const authRateLimiters = {
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'login',
  }),
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyPrefix: 'register',
  }),
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyPrefix: 'reset',
  }),
  verification: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
    keyPrefix: 'verify',
  }),
};
