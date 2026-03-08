import sql from '@/app/api/utils/sql';
import { hash } from 'argon2';
import { requireStagingEnvironment } from '../guard.js';
import { getSession } from '@/utils/session';
import { logAudit } from '@/app/api/utils/audit-logger';

export async function POST(request) {
    try {
        requireStagingEnvironment(); console.log("START API");
        const session = await getSession(request);

        const body = await request.json();
        const config = body; console.log("BODY PARSED", config.company?.name); // the TestEnvironmentConfig payload

        const companyName = config.company?.name || 'Test Sandbox';
        const rawAdminEmail = config.company?.email || 'test+1@dutygrid.test';
        // Intercept logic: Ensure all subsequent generated elements share the staging domain marker
        const adminEmail = rawAdminEmail; // The core admin keeps their memorable email for login.
        const stagingDomain = 'dutygrid-staging.local';

        let password = 'TestPassword123!';
        const hashedPassword = await hash(password);

        // Calculate time offsets
        const now = new Date();
        const offsetDays = config.timeOffsetDays || 0;
        now.setDate(now.getDate() + offsetDays);

        const trialEndsAt = new Date(now);
        trialEndsAt.setDate(trialEndsAt.getDate() + (config.trialDuration || 14));

        let currentPlan = config.plan || 'trial';
        let currentStatus = config.billingStatus || 'trialing';
        let companySize = config.company?.employees || '1-10';

        // 0. Manual "Transaction" Start / Cleanup Setup
        const createdUserIds = [];

        try {
            // 1. Create the Owner (Admin) and Company
            const [adminUser] = await sql`
                INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at, created_at)
                VALUES (${adminEmail}, 'Sandbox Admin', ${companyName}, ${hashedPassword}, ${currentPlan}, '12345678', ${companySize}, ${trialEndsAt}, ${now})
                RETURNING id, company_name
            `;
            createdUserIds.push(adminUser.id);
            await sql`INSERT INTO user_roles (user_id, role) VALUES (${adminUser.id}, 'admin')`;

            // 2. Create the Planner
            const plannerEmail = `planner@${adminUser.id}.${stagingDomain}`;
            const [plannerUser] = await sql`
                INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at, created_at)
                VALUES (${plannerEmail}, 'Sandbox Planner', ${companyName}, ${hashedPassword}, ${currentPlan}, '12345678', ${companySize}, ${trialEndsAt}, ${now})
                RETURNING id
            `;
            createdUserIds.push(plannerUser.id);
            await sql`INSERT INTO user_roles (user_id, role) VALUES (${plannerUser.id}, 'planner')`;

            // 3. Create the Guard (Medewerker)
            const guardEmail = `medewerker@${adminUser.id}.${stagingDomain}`;
            const [guardUser] = await sql`
                INSERT INTO auth_users (email, name, "company_name", password, subscription_status, kvk_number, company_size, trial_ends_at, created_at)
                VALUES (${guardEmail}, 'Sandbox Medewerker', ${companyName}, ${hashedPassword}, ${currentPlan}, '12345678', ${companySize}, ${trialEndsAt}, ${now})
                RETURNING id
            `;
            createdUserIds.push(guardUser.id);
            await sql`INSERT INTO user_roles (user_id, role) VALUES (${guardUser.id}, 'beveiliger')`;

            // 4. Create Employee Records (Required for Guards and Planners to be scheduled)
            const [plannerEmp] = await sql`
                INSERT INTO employees(name, first_name, last_name, email, hourly_rate, status)
                VALUES('Sandbox Planner', 'Sandbox', 'Planner', ${plannerEmail}, 25.00, 'active')
                RETURNING id
            `;
            await sql`UPDATE user_roles SET employee_id = ${plannerEmp.id} WHERE user_id = ${plannerUser.id}`;

            const [guardEmp] = await sql`
                INSERT INTO employees(name, first_name, last_name, email, hourly_rate, status)
                VALUES('Sandbox Medewerker', 'Sandbox', 'Medewerker', ${guardEmail}, 18.50, 'active')
                RETURNING id
            `;
            await sql`UPDATE user_roles SET employee_id = ${guardEmp.id} WHERE user_id = ${guardUser.id}`;

            // 5. Apply Seed Data if requested
            if (config.mode !== 'blank') {
                const seed = config.seedData || {};
                let employeeIds = [plannerEmp.id, guardEmp.id];
                let clientId = null;
                let assignmentId = null;

                // Seed Clients
                if (seed.clients) {
                    const [client] = await sql`
                        INSERT INTO clients (name, email, city, status) 
                        VALUES (${'Client ' + companyName}, ${`client@${adminUser.id}.${stagingDomain}`}, 'Utrecht', 'active')
                        RETURNING id
                    `;
                    clientId = client.id;

                    const [assignment] = await sql`
                        INSERT INTO assignments (client_id, name, city, status)
                        VALUES (${client.id}, ${'Assignment ' + companyName}, 'Utrecht', 'active')
                        RETURNING id
                    `;
                    assignmentId = assignment.id;
                }

                // Seed extra employees based on config mode
                if (seed.employees) {
                    const extraEmpCount = config.mode === 'preset_pro' ? 38 : config.mode === 'preset_growth' ? 13 : 3;
                    const promises = Array.from({ length: extraEmpCount }).map((_, i) => sql`
                        INSERT INTO employees (name, first_name, last_name, email, hourly_rate, status)
                        VALUES (${"Guard " + i}, 'Guard', ${i.toString()}, ${`guard${i}@${adminUser.id}.${stagingDomain}`}, 20.00, 'active')
                        RETURNING id
                    `);
                    const results = await Promise.all(promises);
                    results.forEach(res => employeeIds.push(res[0].id));
                }

                // Seed Shifts
                if (seed.shifts && assignmentId) {
                    const totalShifts = config.mode === 'preset_pro' ? 100 : config.mode === 'preset_growth' ? 20 : 3;
                    const shiftPromises = Array.from({ length: totalShifts }).map(() => {
                        const randomEmp = employeeIds[Math.floor(Math.random() * employeeIds.length)];
                        const start = new Date(now);
                        start.setDate(now.getDate() + (Math.floor(Math.random() * 15) - 7));
                        start.setHours(Math.floor(Math.random() * 14) + 6, 0, 0, 0);
                        const end = new Date(start);
                        end.setHours(start.getHours() + 8);

                        return sql`
                            INSERT INTO shifts (assignment_id, employee_id, start_time, end_time, status)
                            VALUES (${assignmentId}, ${randomEmp}, ${start.toISOString()}, ${end.toISOString()}, 'planned')
                        `;
                    });
                    await Promise.all(shiftPromises);
                }

                // Seed Incidents
                if (seed.incidents) {
                    const totalIncidents = config.mode === 'preset_pro' ? 20 : config.mode === 'preset_growth' ? 5 : 1;
                    const incidentPromises = Array.from({ length: totalIncidents }).map((_, i) => sql`
                        INSERT INTO incidents (title, description, severity, status, location, reported_at)
                        VALUES (${'Mock Incident ' + i}, 'Automatically generated incident.', 'medium', 'open', 'Utrecht', ${now.toISOString()})
                    `);
                    await Promise.all(incidentPromises);
                }
            }

            // 6. Log Audit Event
            if (session?.user?.id) {
                await logAudit(
                    session,
                    'CREATE',
                    'staging_environment',
                    adminUser.id,
                    null,
                    { companyName, mode: config.mode, adminEmail },
                    request
                );
            }

            // Return success
            return Response.json({
                success: true,
                message: `Environment for ${companyName} built successfully!`,
                company: {
                    id: adminUser.id,
                    name: companyName,
                    adminEmail,
                    plannerEmail,
                    guardEmail,
                    password: password,
                    trialEndsAt: trialEndsAt.toISOString()
                }
            });

        } catch (dbError) {
            console.error('[Build-Environment] DB Error, attempting rollback:', dbError);
            // Poor man's rollback if neon HTTP driver fails to transaction hook
            if (createdUserIds.length > 0) {
                try {
                    await sql`DELETE FROM auth_users WHERE id = ANY(${createdUserIds})`;
                } catch (rollbackErr) {
                    console.error('Fatal rollback failed:', rollbackErr);
                }
            }
            throw dbError; // rethrow to outer catch
        }

    } catch (error) {
        console.error('[StagingToolkit] Orhcestrator Error:', error);
        // Postgres errors often have code or detail
        let errorMsg = error.message;
        if (error.code) errorMsg += ` (Code: ${error.code})`;
        return Response.json(
            { success: false, error: 'API Error: ' + errorMsg },
            { status: 500 }
        );
    }
}
