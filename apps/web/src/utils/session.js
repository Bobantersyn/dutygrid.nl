
import sql from '@/app/api/utils/sql';

export async function getSession(request) {
    try {
        const cookieHeader = request.headers.get('cookie');
        console.log('[getSession] Cookie header present:', !!cookieHeader, 'Length:', cookieHeader?.length);
        if (!cookieHeader) {
            console.log('[getSession] No cookie header found');
            return null;
        }

        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            })
        );

        const sessionToken = cookies.session;
        console.log('[getSession] Session token found:', !!sessionToken);

        if (!sessionToken) {
            console.log('[getSession] No session cookie found in header');
            return null;
        }

        const sessions = await sql`
      SELECT s.*, u.id as "userId", u.email, u.name
      FROM auth_sessions s
      JOIN auth_users u ON s."userId" = u.id
      WHERE s."sessionToken" = ${sessionToken}
      AND s.expires > NOW()
      LIMIT 1
    `;

        if (sessions.length === 0) {
            console.log('[getSession] Session not found in DB or expired');
            return null;
        }

        const session = sessions[0];
        console.log('[getSession] Session valid for user:', session.email);
        return {
            user: {
                id: session.userId,
                email: session.email,
                name: session.name
            },
            expires: session.expires
        };
    } catch (error) {
        console.error('getSession error:', error);
        return null;
    }
}
