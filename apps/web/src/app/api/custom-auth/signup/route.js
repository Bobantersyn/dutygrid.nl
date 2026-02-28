import sql from '@/app/api/utils/sql';
import { hash } from 'argon2';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dutygrid-secret-key-change-in-production'
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { company, name, email, password, kvk, company_size } = body;

        // Validation
        if (!company || !name || !email || !password || !kvk || !company_size) {
            return Response.json(
                { error: 'Alle velden inclusief KvK en bedrijfsgrootte zijn verplicht.' },
                { status: 400 }
            );
        }

        // Free email detection
        const freeEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'live.nl', 'hotmail.nl', 'icloud.com', 'msn.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        const isFreeEmail = freeEmailDomains.includes(domain);
        const lowPriority = isFreeEmail;


        if (password.length < 8) {
            return Response.json(
                { error: 'Wachtwoord moet minimaal 8 tekens lang zijn.' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUsers = await sql`SELECT id, subscription_status, trial_ends_at FROM auth_users WHERE email = ${email} OR kvk_number = ${kvk} LIMIT 1`;
        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            if (existing.subscription_status === 'deleted_retention') {
                return Response.json(
                    { error: 'Dit bedrijf of e-mailadres is geblokkeerd voor nieuwe proefperiodes (90 dagen cooldown).' },
                    { status: 403 }
                );
            }
            return Response.json(
                { error: 'Er bestaat al een account met dit e-mailadres of KvK-nummer.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password);

        // Insert new user as trialing
        const insertedUser = await sql`
            INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, is_free_email, low_priority_support)
            VALUES (${email}, ${name}, ${company}, ${hashedPassword}, 'trialing', ${kvk}, ${company_size}, ${isFreeEmail}, ${lowPriority})
            RETURNING id, email, name, "company_name", kvk_number, company_size, trial_ends_at
        `;

        const user = insertedUser[0];

        // Assign 'admin' role to this first user of the newly created trial "tenant"
        await sql`
            INSERT INTO user_roles (user_id, role)
            VALUES (${user.id.toString()}, 'admin')
        `;

        // Create Session
        const durationSeconds = 30 * 24 * 60 * 60; // 30 days
        const durationString = '30d';

        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            name: user.name,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(durationString)
            .sign(JWT_SECRET);

        const sessionToken = crypto.randomUUID();
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + durationSeconds);

        await sql`
            INSERT INTO auth_sessions ("sessionToken", "userId", expires)
            VALUES (${sessionToken}, ${user.id}, ${expires})
        `;

        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? 'Secure;' : '';

        // Return successful signup payload and set cookie
        return Response.json(
            {
                success: true,
                message: 'Account succesvol aangemaakt',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    company_name: user.company_name,
                    trial_ends_at: user.trial_ends_at
                },
                token,
                sessionToken,
            },
            {
                status: 201,
                headers: {
                    'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}; ${secureFlag}`,
                },
            }
        );

    } catch (error) {
        console.error('[Signup API] Error:', error);
        return Response.json(
            { error: 'Er is een interne fout opgetreden. Probeer het later opnieuw.' },
            { status: 500 }
        );
    }
}
