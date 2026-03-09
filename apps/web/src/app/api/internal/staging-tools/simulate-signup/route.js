import sql from '@/app/api/utils/sql';
import { hash } from 'argon2';
import { requireStagingEnvironment } from '../guard.js';

export async function POST(request) {
    try {
        requireStagingEnvironment();

        const body = await request.json();
        const { companyName, email, employees, plan } = body;

        if (!companyName || !email) {
            return Response.json(
                { error: 'Bedrijfsnaam en E-mail zijn verplicht voor de signup simulatie.' },
                { status: 400 }
            );
        }

        const defaultPassword = 'TestPassword123!';
        const hashedPassword = await hash(defaultPassword);

        // Calculate trial end date (14 days from now)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        // Default KVk to test number
        const kvk = 'TEST-KVK-' + Math.floor(1000 + Math.random() * 9000);

        // Detect free email
        const freeEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'live.nl', 'hotmail.nl', 'icloud.com', 'msn.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        const isFreeEmail = freeEmailDomains.includes(domain);

        // Check if user already exists
        const existingUsers = await sql`SELECT id FROM auth_users WHERE email = ${email} LIMIT 1`;
        if (existingUsers.length > 0) {
            return Response.json(
                { error: 'Er bestaat al een testaccount met dit e-mailadres. Gebruik +1, +2 etc.' },
                { status: 409 }
            );
        }

        // 1. Create the User conceptually mimicking the Signup Funnel
        const insertedUser = await sql`
            INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, is_free_email, low_priority_support, trial_ends_at)
            VALUES (${email}, 'Test Eigenaar', ${companyName}, ${hashedPassword}, 'trialing', ${kvk}, ${employees || '1-5'}, ${isFreeEmail}, ${isFreeEmail}, ${trialEndsAt})
            RETURNING id, email, "company_name", trial_ends_at
        `;

        const user = insertedUser[0];

        // 2. Assign 'admin' role to this first user
        await sql`
            INSERT INTO user_roles (user_id, role)
            VALUES (${user.id.toString()}, 'admin')
        `;

        // 3. Create dummy employee record for the owner to enable planning rights logic
        const [adminEmp] = await sql`
            INSERT INTO employees(name, first_name, last_name, email, hourly_rate, status)
            VALUES('Test Eigenaar', 'Test', 'Eigenaar', ${email}, 0.00, 'active')
            RETURNING id
        `;

        // Link role to employee
        await sql`UPDATE user_roles SET employee_id = ${adminEmp.id} WHERE user_id = ${user.id.toString()}`;

        // 4. In a real app we would trigger a verification email here. 
        // For staging, we drop a log line that indicates this would have been sent to Mail Sink.
        // We now use the actual mailer utility which intercepts it into the DB!
        const { sendEmail } = await import('@/app/api/utils/mailer');
        await sendEmail({
            to: email,
            subject: 'Welkom bij DutyGrid! Je 14-daagse Proefperiode',
            bodyText: `Beste Eigenaar,\n\nBedankt voor je registratie bij DutyGrid.\nJe trial voor plan '${plan || 'professional'}' loopt tot ${user.trial_ends_at.toLocaleDateString()}.\n\nJe automatische inlogwachtwoord voor deze test is: ${defaultPassword}\n\nSucces met plannen!`,
            tenantId: user.id
        });
        console.log(`[Staging SIMULATE SIGNUP] Trial Welcome / Verification email triggered for ${email}`);


        return Response.json({
            success: true,
            message: `Signup funnel gesimuleerd voor '${companyName}'. Trial gestart op plan: ${plan || 'professional'}.`,
            company: {
                name: companyName,
                adminEmail: email,
                password: defaultPassword,
                trialEndsAt: user.trial_ends_at,
                planSelected: plan || 'professional'
            }
        });

    } catch (error) {
        console.error('[StagingToolkit] Simulate Signup Error:', error);
        return Response.json(
            { error: 'Interne fout bij het simuleren van de signup flow.', details: error.message },
            { status: 500 }
        );
    }
}
