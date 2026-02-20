import sql from '@/app/api/utils/sql';
import { verify } from 'argon2';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, rememberMe } = body;

        // ... (validation and user fetch skipped for brevity in prompt, keeping existing)
        if (!email || !password) {
            return Response.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const users = await sql`SELECT * FROM auth_users WHERE email = ${email} LIMIT 1`;

        if (users.length === 0) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        const user = users[0];

        const isValid = await verify(user.password, password);
        if (!isValid) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Duration logic
        // If rememberMe: 30 days. Else: 1 day.
        const durationSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const durationString = rememberMe ? '30d' : '1d';

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

        // Return success with token
        return Response.json(
            {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
                sessionToken,
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}; Secure`,
                },
            }
        );
    } catch (error) {
        console.error('[Login API] Error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
