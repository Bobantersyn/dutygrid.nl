import sql from '@/app/api/utils/sql';

export async function POST(request) {
    try {
        // Get session token from cookie
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return Response.json({ success: true }, { status: 200 });
        }

        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            })
        );

        const sessionToken = cookies.session || cookies['dutygrid-session'];
        if (sessionToken) {
            // Delete session from database
            await sql`
        DELETE FROM auth_sessions
        WHERE "sessionToken" = ${sessionToken}
      `;
        }

        const headers = new Headers();
        headers.append('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
        headers.append('Set-Cookie', 'dutygrid-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');

        // Clear cookie
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('[Logout API] Error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
