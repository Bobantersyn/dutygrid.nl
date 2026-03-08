import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function getSuperAdminSession(request) {
    try {
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) return null;

        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            })
        );

        const token = cookies.admin_session;
        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (!payload.is_super_admin) return null;

        return {
            user: {
                id: payload.userId,
                email: payload.email,
                name: payload.name,
            },
        };
    } catch (error) {
        console.error('[getSuperAdminSession] Validatie error:', error);
        return null;
    }
}
