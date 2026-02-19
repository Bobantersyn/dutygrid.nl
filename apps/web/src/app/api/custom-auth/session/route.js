import sql from '@/app/api/utils/sql';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function GET(request) {
    try {
        // Get session token from cookie
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return Response.json({ user: null }, { status: 200 });
        }

        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            })
        );

        const sessionToken = cookies.session;
        if (!sessionToken) {
            return Response.json({ user: null }, { status: 200 });
        }

        // Get session from database
        const sessions = await sql`
      SELECT s.*, u.id, u.email, u.name, u.image
      FROM auth_sessions s
      JOIN auth_users u ON s."userId" = u.id
      WHERE s."sessionToken" = ${sessionToken}
      AND s.expires > NOW()
      LIMIT 1
    `;

        if (sessions.length === 0) {
            return Response.json({ user: null }, { status: 200 });
        }

        const session = sessions[0];

        // Return user data
        return Response.json({
            user: {
                id: session.id,
                email: session.email,
                name: session.name,
                image: session.image,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('[Session API] Error:', error);
        return Response.json({ user: null }, { status: 200 });
    }
}
