import sql from '@/app/api/utils/sql';
import { verify } from 'argon2';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

// Comma-separated list of allowed Super Admin emails in .env
// Fallback for development/testing if not set:
const getSuperAdminEmails = () => {
    const fromEnv = process.env.SUPER_ADMIN_EMAILS;
    if (fromEnv) return fromEnv.split(',').map(e => e.trim().toLowerCase());
    return ['roland@dutygrid.nl', 'rolandantersyn@gmail.com']; // Default Platform Owner
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, rememberMe } = body;

        if (!email || !password) {
            return Response.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const allowedAdmins = getSuperAdminEmails();

        // 1. Verify if the email is in the allowed Super Admin list
        if (!allowedAdmins.includes(normalizedEmail)) {
            // Log security event (failed attempt by non-admin)
            console.warn(`[Security] Unauthorized Super Admin login attempt: ${normalizedEmail}`);
            return Response.json({ error: 'You are not authorized to access the Super Admin environment.' }, { status: 403 });
        }

        // 2. Lookup the user account to verify the password
        const users = await sql`SELECT * FROM auth_users WHERE email = ${normalizedEmail} LIMIT 1`;

        if (users.length === 0) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const user = users[0];

        if (!user.password) {
            return Response.json({ error: 'Account has no password' }, { status: 401 });
        }

        const isValid = await verify(user.password, password);
        if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Create Super Admin JWT token
        const durationSeconds = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60; // 30 days or 12 hours
        const durationString = rememberMe ? '30d' : '12h';

        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            name: user.name,
            is_super_admin: true, // Crucial flag for internal APIs
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(durationString)
            .sign(JWT_SECRET);

        // 4. Set secure cookie
        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? 'Secure;' : '';
        const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}; ${secureFlag}`;

        return Response.json(
            {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': `admin_session=${token}; ${cookieOptions}`,
                },
            }
        );
    } catch (error) {
        console.error('[Admin Login API] Error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
