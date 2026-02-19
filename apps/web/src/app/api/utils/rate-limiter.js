import sql from '@/app/api/utils/sql';

/**
 * Rate Limiter - Bescherm API endpoints tegen brute force attacks
 * 
 * Gebruikt in-memory cache + database logging voor rate limiting
 */

// In-memory cache voor snelle lookups
const rateLimitCache = new Map();

// Cleanup oude entries elke 5 minuten
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitCache.entries()) {
        if (now > data.resetTime) {
            rateLimitCache.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Rate limit configuraties per endpoint type
 */
const RATE_LIMITS = {
    // Auth endpoints - streng
    'auth.login': {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minuten
        message: 'Too many login attempts. Please try again in 15 minutes.'
    },
    'auth.2fa': {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
        message: 'Too many 2FA attempts. Please try again in 15 minutes.'
    },

    // API endpoints - normaal
    'api.default': {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minuten
        message: 'Too many requests. Please try again later.'
    },

    // Mutations (POST/PUT/DELETE) - iets strenger
    'api.mutation': {
        maxRequests: 50,
        windowMs: 15 * 60 * 1000,
        message: 'Too many requests. Please slow down.'
    },

    // Per user limits (voor authenticated requests)
    'user.default': {
        maxRequests: 1000,
        windowMs: 60 * 60 * 1000, // 1 uur
        message: 'Rate limit exceeded. Please try again later.'
    }
};

/**
 * Get rate limit key
 * 
 * @param {string} identifier - IP address of user ID
 * @param {string} limitType - Type rate limit
 * @returns {string} Cache key
 */
function getRateLimitKey(identifier, limitType) {
    return `${limitType}:${identifier}`;
}

/**
 * Check rate limit
 * 
 * @param {string} identifier - IP address of user ID
 * @param {string} limitType - Type rate limit (bijv. 'auth.login', 'api.default')
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, limitType = 'api.default') {
    const config = RATE_LIMITS[limitType] || RATE_LIMITS['api.default'];
    const key = getRateLimitKey(identifier, limitType);
    const now = Date.now();

    // Get of create cache entry
    let entry = rateLimitCache.get(key);

    if (!entry || now > entry.resetTime) {
        // Nieuwe window
        entry = {
            count: 0,
            resetTime: now + config.windowMs
        };
        rateLimitCache.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Check if over limit
    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    return {
        allowed,
        remaining,
        resetTime: entry.resetTime,
        limit: config.maxRequests,
        message: config.message
    };
}

/**
 * Log rate limit violation to database
 * 
 * @param {string} identifier - IP or user ID
 * @param {string} endpoint - Endpoint path
 * @param {string} limitType - Type rate limit
 * @param {number} requestCount - Aantal requests in window
 */
export async function logRateLimitViolation(
    identifier,
    endpoint,
    limitType,
    requestCount
) {
    try {
        const config = RATE_LIMITS[limitType] || RATE_LIMITS['api.default'];
        const blockedUntil = new Date(Date.now() + config.windowMs);

        await sql`
      INSERT INTO rate_limit_violations (
        ip_address,
        endpoint,
        request_count,
        limit_type,
        window_start,
        blocked_until
      ) VALUES (
        ${identifier},
        ${endpoint},
        ${requestCount},
        ${limitType},
        NOW(),
        ${blockedUntil}
      )
    `;
    } catch (error) {
        console.error('[RateLimit] Failed to log violation:', error);
    }
}

/**
 * Rate limit middleware voor API routes
 * 
 * @param {Request} request - HTTP request
 * @param {string} limitType - Type rate limit
 * @param {string|null} userId - User ID (voor authenticated requests)
 * @returns {Response|null} Response als rate limited, null als allowed
 */
export async function rateLimitMiddleware(
    request,
    limitType = 'api.default',
    userId = null
) {
    // Get identifier (user ID of IP)
    const identifier = userId || getClientIP(request);

    // Check rate limit
    const result = checkRateLimit(identifier, limitType);

    if (!result.allowed) {
        // Log violation
        const url = new URL(request.url);
        await logRateLimitViolation(
            identifier,
            url.pathname,
            limitType,
            result.limit + 1
        );

        // Return 429 response
        return Response.json(
            {
                error: result.message,
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                    'X-RateLimit-Limit': result.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
                }
            }
        );
    }

    // Allowed - return null (continue)
    return null;
}

/**
 * Get client IP from request
 * 
 * @param {Request} request
 * @returns {string} IP address
 */
function getClientIP(request) {
    // Try verschillende headers (voor proxies)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}

/**
 * Add rate limit headers to response
 * 
 * @param {Response} response - Response object
 * @param {Object} rateLimit - Rate limit result
 * @returns {Response} Response met headers
 */
export function addRateLimitHeaders(response, rateLimit) {
    const headers = new Headers(response.headers);

    headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

export default {
    checkRateLimit,
    logRateLimitViolation,
    rateLimitMiddleware,
    addRateLimitHeaders
};
