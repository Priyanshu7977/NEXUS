/**
 * NEXUS Client Rate Limiter & Brute-Force Shield
 * Implements an in-memory token bucket & sliding window rate limiter
 * to block brute-force credential attacks, spamming, and API abuse.
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  blockedUntil?: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  message?: string;
}

export class ClientRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();

  /**
   * Evaluates if a given action key is permitted under the rate limit policy.
   * @param key Unique identifier (e.g. `login:user@example.com` or `action:workspaceId`)
   * @param maxRequests Maximum allowed requests within the window
   * @param windowMs Time window in milliseconds
   */
  public check(key: string, maxRequests: number = 5, windowMs: number = 60000): RateLimitCheckResult {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: maxRequests - 1, lastRefill: now };
      this.buckets.set(key, bucket);
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Check if key is temporarily locked out
    if (bucket.blockedUntil && now < bucket.blockedUntil) {
      const waitSeconds = Math.ceil((bucket.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: waitSeconds,
        message: `Too many attempts. Locked out for ${waitSeconds} seconds.`,
      };
    }

    // Refill tokens proportionally to elapsed time
    const elapsed = now - bucket.lastRefill;
    if (elapsed > windowMs) {
      bucket.tokens = maxRequests;
      bucket.lastRefill = now;
      delete bucket.blockedUntil;
    } else {
      const tokensToAdd = Math.floor((elapsed / windowMs) * maxRequests);
      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(maxRequests, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
      }
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: bucket.tokens };
    }

    // Apply progressive lockout penalty (e.g. 60 seconds)
    bucket.blockedUntil = now + Math.min(windowMs, 60000);
    const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
      message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
    };
  }

  /**
   * Resets rate limit for a specific action key (e.g. after successful login).
   */
  public reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clears old, stale buckets to prevent memory leaks.
   */
  public prune(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > 300000 && (!bucket.blockedUntil || now > bucket.blockedUntil)) {
        this.buckets.delete(key);
      }
    }
  }
}

// Global shared instances for critical flows
export const authRateLimiter = new ClientRateLimiter();
export const workflowRateLimiter = new ClientRateLimiter();
export const apiKeyRateLimiter = new ClientRateLimiter();
