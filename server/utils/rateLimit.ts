import type { H3Event } from "h3";

interface Bucket {
    count: number;
    resetAt: number;
}

/**
 * In-memory fixed-window rate limiter.
 *
 * Scoped to a single server instance, so it is a speed bump rather than a hard
 * guarantee on a multi-instance deployment. That is still enough to make online
 * password guessing against the admin login impractical.
 */
const buckets = new Map<string, Bucket>();

/** Drop expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

export function getClientIp(event: H3Event): string {
    const forwarded = getRequestHeader(event, "x-forwarded-for");
    if (forwarded) {
        // Left-most entry is the original client.
        return forwarded.split(",")[0]!.trim();
    }

    return (
        getRequestHeader(event, "x-real-ip") ||
        event.node.req.socket.remoteAddress ||
        "unknown"
    );
}

/**
 * Throws a 429 once `limit` attempts have been made within `windowMs`.
 */
export function rateLimit(
    event: H3Event,
    options: { key: string; limit: number; windowMs: number },
) {
    const now = Date.now();

    // Amortise cleanup instead of running a timer.
    if (buckets.size > 500) sweep(now);

    const bucketKey = `${options.key}:${getClientIp(event)}`;
    const bucket = buckets.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
        return;
    }

    bucket.count++;

    if (bucket.count > options.limit) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        setResponseHeader(event, "Retry-After", String(retryAfter));
        throw createError({
            statusCode: 429,
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        });
    }
}
