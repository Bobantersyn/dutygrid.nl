import sql from '@/app/api/utils/sql';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import { requireStagingEnvironment } from '../guard.js';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function GET(request) {
    try {
        requireStagingEnvironment();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return Response.json({ error: 'Email required' }, { status: 400 });
        }

        const users = await sql`SELECT * FROM auth_users WHERE email = ${email} LIMIT 1`;
        if (users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }
        const user = users[0];

        // 30 day impersonation session since it's staging
        const durationSeconds = 30 * 24 * 60 * 60;
        const durationString = '30d';

        // Create JWT token
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            name: user.name,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(durationString)
            .sign(JWT_SECRET);

        // Create session in database
        const sessionToken = crypto.randomUUID();
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + durationSeconds);

        await sql`
            INSERT INTO auth_sessions ("sessionToken", "userId", expires)
            VALUES (${sessionToken}, ${user.id}, ${expires})
        `;

        const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure;' : '';

        // Redirect to the main planning app on the correct domain with cookie initialized
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/planning',
                'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}; ${secureFlag}`,
            }
        });
    } catch (error) {
        console.error('[Impersonate API] Error:', error);
        return new Response(`INTERNAL CRASH: ${error.message}`, { status: 500 });
    }
}
