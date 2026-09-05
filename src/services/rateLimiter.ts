/**
 * NEXUS Rate Limiter Service
 * 
 * Provides in-memory sliding-window rate limiting for API keys, user actions,
 * and workflow/agent execution requests.
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds?: number;
}

export class SlidingWindowRateLimiter {
  private windows: Map<string, number[]> = new Map();
  private cleanupInterval: any = null;

  constructor(private defaultLimit: number = 60, private defaultWindowMs: number = 60000) {
    // Periodic garbage collection every 2 minutes in long-running node runtimes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 120000);
      if (this.cleanupInterval?.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Checks if a request for a given key is allowed under rate limits.
   * Records the timestamp if allowed.
   */
  public check(
    key: string,
    limit: number = this.defaultLimit,
    windowMs: number = this.defaultWindowMs
  ): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.windows.get(key);
    if (!timestamps) {
      timestamps = [];
      this.windows.set(key, timestamps);
    }

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter((t) => t > windowStart);
    this.windows.set(key, timestamps);

    const count = timestamps.length;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - (allowed ? 1 : 0));

    // Oldest timestamp in window determines when slot frees up
    const oldestTimestamp = timestamps[0] || now;
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);

    if (allowed) {
      timestamps.push(now);
      return {
        allowed: true,
        limit,
        remaining,
        resetMs,
      };
    }

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs,
      retryAfterSeconds: Math.ceil(resetMs / 1000),
    };
  }

  /**
   * Resets rate limit counters for a specific key (e.g. on manual unlock or testing).
   */
  public reset(key: string): void {
    this.windows.delete(key);
  }

  /**
   * Removes stale window entries to prevent memory accumulation.
   */
  public cleanup(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [key, timestamps] of this.windows.entries()) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - maxAgeMs) {
        this.windows.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global singletons for runtime operations
export const apiRateLimiter = new SlidingWindowRateLimiter(60, 60000); // 60 req/min for API Keys
export const executionRateLimiter = new SlidingWindowRateLimiter(30, 60000); // 30 executions/min per workspace
export const authRateLimiter = new SlidingWindowRateLimiter(10, 60000); // 10 attempts/min
