/**
 * Security Headers Middleware
 * 
 * Voegt security headers toe aan alle responses
 */

/**
 * Get security headers
 * 
 * @returns {Object} Headers object
 */
export function getSecurityHeaders() {
    return {
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',

        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',

        // XSS Protection (legacy, maar nog steeds nuttig)
        'X-XSS-Protection': '1; mode=block',

        // Referrer Policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // Content Security Policy
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React needs unsafe-inline/eval
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'"
        ].join('; '),

        // Permissions Policy (voorheen Feature-Policy)
        'Permissions-Policy': [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()'
        ].join(', '),

        // Strict Transport Security (HTTPS only)
        // Alleen als je HTTPS gebruikt!
        // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
}

/**
 * Add security headers to response
 * 
 * @param {Response} response - Response object
 * @returns {Response} Response met security headers
 */
export function addSecurityHeaders(response) {
    const headers = new Headers(response.headers);
    const securityHeaders = getSecurityHeaders();

    for (const [key, value] of Object.entries(securityHeaders)) {
        headers.set(key, value);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

/**
 * Security headers middleware voor API routes
 * 
 * Gebruik dit in je route handlers:
 * 
 * export async function GET(request) {
 *   const response = Response.json({ data: 'hello' });
 *   return addSecurityHeaders(response);
 * }
 */
export function securityHeadersMiddleware(handler) {
    return async (request, ...args) => {
        const response = await handler(request, ...args);
        return addSecurityHeaders(response);
    };
}

export default {
    getSecurityHeaders,
    addSecurityHeaders,
    securityHeadersMiddleware
};
