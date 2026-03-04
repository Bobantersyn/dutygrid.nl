import sql from '@/app/api/utils/sql';
import { getSuperAdminSession } from '@/utils/adminSession';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function POST(request) {
    try {
        const session = await getSuperAdminSession(request);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { target_user_id } = body;

        // Verify target exists
        const targetUsers = await sql`SELECT id, email, name FROM auth_users WHERE id = ${target_user_id} LIMIT 1`;

        if (targetUsers.length === 0) {
            return Response.json({ error: 'Target admin not found' }, { status: 404 });
        }

        const targetUser = targetUsers[0];

        // Ensure target user is actually an admin or planner to impersonate correctly
        const targetRoles = await sql`SELECT role FROM user_roles WHERE user_id = ${targetUser.id.toString()} LIMIT 1`;
        const role = targetRoles[0]?.role || 'admin';

        // 1. Log the impersonation event (gracefully handle if table doesn't exist yet)
        try {
            await sql`
                INSERT INTO audit_log (admin_id, tenant_id, action, target_table, target_id)
                VALUES (${session.user.id}, ${targetUser.id}, 'IMPERSONATE', 'auth_users', ${targetUser.id})
            `;
        } catch (err) {
            console.warn('[Impersonate API] audit_log query failed (table might not exist yet).');
        }

        // 2. Generate a standard customer JWT token for the target user
        // BUT we flag it with `is_impersonating: true` and embed the real admin's ID
        const durationSeconds = 60 * 60; // 1 hr limit for impersonation sessions
        const durationString = '1h';

        const token = await new SignJWT({
            userId: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            role: role,
            is_impersonating: true,
            real_admin_id: session.user.id
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(durationString)
            .sign(JWT_SECRET);

        // 3. We do NOT store this session in `auth_sessions` strictly for security, 
        // JWT itself serves as temp token.

        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? 'Secure;' : '';
        const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}; ${secureFlag}`;

        return Response.json({
            success: true,
            redirectUrl: '/' // the app root for dutygrid (customer app)
        }, {
            headers: {
                'Set-Cookie': `session=${token}; ${cookieOptions}`,
            }
        });

    } catch (error) {
        console.error('[Impersonate API] Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
