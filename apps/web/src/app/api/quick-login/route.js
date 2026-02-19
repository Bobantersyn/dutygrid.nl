import sql from '@/app/api/utils/sql';
import { verify } from 'argon2';

/**
 * POST /api/quick-login
 * 
 * Tijdelijke login endpoint om Auth.js te bypassen
 * Alleen voor development!
 */
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ error: 'Email en wachtwoord vereist' }, { status: 400 });
        }

        // Zoek user
        const users = await sql`
      SELECT * FROM auth_users WHERE email = ${email} LIMIT 1
    `;

        if (users.length === 0) {
            return Response.json({ error: 'Gebruiker niet gevonden' }, { status: 401 });
        }

        const user = users[0];

        // Zoek credentials account
        const accounts = await sql`
      SELECT * FROM auth_accounts 
      WHERE "userId" = ${user.id} 
      AND provider = 'credentials'
      LIMIT 1
    `;

        if (accounts.length === 0) {
            return Response.json({ error: 'Geen credentials gevonden' }, { status: 401 });
        }

        const account = accounts[0];

        // Verify password
        const isValid = await verify(account.password, password);

        if (!isValid) {
            return Response.json({ error: 'Onjuist wachtwoord' }, { status: 401 });
        }

        // Haal user role op
        const roles = await sql`
      SELECT role FROM user_roles WHERE user_id = ${user.id.toString()} LIMIT 1
    `;
        const role = roles[0]?.role || 'beveiliger';

        // Create session token
        const sessionToken = crypto.randomUUID();
        const expires = new Date();
        expires.setDate(expires.getDate() + 30); // 30 dagen

        // Save session
        await sql`
      INSERT INTO auth_sessions ("sessionToken", "userId", expires)
      VALUES (${sessionToken}, ${user.id}, ${expires})
    `;

        // Create response with cookie
        const response = Response.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role,
            },
            message: 'Login succesvol! ✅',
        });

        // Set cookie via header
        response.headers.set(
            'Set-Cookie',
            `dutygrid-session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
        );

        return response;
    } catch (error) {
        console.error('Quick login error:', error);
        return Response.json(
            { error: 'Login mislukt', details: error.message },
            { status: 500 }
        );
    }
}
