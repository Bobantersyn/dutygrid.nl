import sql from '@/app/api/utils/sql';
import { hash } from 'argon2';
import { requireStagingEnvironment } from '../guard.js';

export async function POST(request) {
    try {
        requireStagingEnvironment();

        const rand = Math.random().toString(36).substring(2, 7);
        const companyName = `Test Sandbox ${rand.toUpperCase()}`;
        const domain = `test-${rand}.com`;

        const adminEmail = `admin@${domain}`;
        const plannerEmail = `planner@${domain}`;
        const guardEmail = `medewerker@${domain}`;

        const defaultPassword = 'TestPassword123!';
        const hashedPassword = await hash(defaultPassword);

        // Calculate trial end date (14 days from now)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        // 1. Create the Owner (Admin) and Company
        const [adminUser] = await sql`
            INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at)
            VALUES (${adminEmail}, 'Sandbox Admin', ${companyName}, ${hashedPassword}, 'trialing', '12345678', '1-10', ${trialEndsAt})
            RETURNING id, company_name
        `;

        await sql`INSERT INTO user_roles (user_id, role) VALUES (${adminUser.id.toString()}, 'admin')`;

        // 2. Create the Planner
        const [plannerUser] = await sql`
            INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at)
            VALUES (${plannerEmail}, 'Sandbox Planner', ${companyName}, ${hashedPassword}, 'trialing', '12345678', '1-10', ${trialEndsAt})
            RETURNING id
        `;

        await sql`INSERT INTO user_roles (user_id, role) VALUES (${plannerUser.id.toString()}, 'planner')`;

        // 3. Create the Guard (Medewerker)
        const [guardUser] = await sql`
            INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at)
            VALUES (${guardEmail}, 'Sandbox Medewerker', ${companyName}, ${hashedPassword}, 'trialing', '12345678', '1-10', ${trialEndsAt})
            RETURNING id
        `;

        await sql`INSERT INTO user_roles (user_id, role) VALUES (${guardUser.id.toString()}, 'beveiliger')`;

        // 4. Create Employee Records (Required for Guards and Planners to be scheduled)
        const [plannerEmp] = await sql`
            INSERT INTO employees(name, first_name, last_name, email, hourly_rate, status)
            VALUES('Sandbox Planner', 'Sandbox', 'Planner', ${plannerEmail}, 25.00, 'active')
            RETURNING id
        `;
        // Link role to employee
        await sql`UPDATE user_roles SET employee_id = ${plannerEmp.id} WHERE user_id = ${plannerUser.id.toString()}`;

        const [guardEmp] = await sql`
            INSERT INTO employees(name, first_name, last_name, email, hourly_rate, status)
            VALUES('Sandbox Medewerker', 'Sandbox', 'Medewerker', ${guardEmail}, 18.50, 'active')
            RETURNING id
        `;
        await sql`UPDATE user_roles SET employee_id = ${guardEmp.id} WHERE user_id = ${guardUser.id.toString()}`;

        return Response.json({
            success: true,
            message: `Bedrijf '${companyName}' gegenereerd met 3 gebruikers.`,
            company: {
                name: companyName,
                adminEmail,
                plannerEmail,
                guardEmail,
                password: defaultPassword,
                trialEndsAt
            }
        });

    } catch (error) {
        console.error('[StagingToolkit] Create Company Error:', error);
        return Response.json(
            { error: 'Interne fout bij het aanmaken van testbedrijf.', details: error.message },
            { status: 500 }
        );
    }
}
