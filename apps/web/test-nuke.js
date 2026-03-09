import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const targetDomainPattern = '%@%.dutygrid-staging.local';

        const employees = await sql`SELECT id FROM employees WHERE email LIKE ${targetDomainPattern}`;
        const employeeIds = employees.map(e => e.id);

        if (employeeIds.length > 0) {
            console.log("Deleting incidents and shifts...");
            await sql`DELETE FROM incidents WHERE employee_id = ANY(${employeeIds})`;
            await sql`DELETE FROM shifts WHERE employee_id = ANY(${employeeIds})`;
        }

        console.log("Deleting assignments...");
        await sql`DELETE FROM assignments WHERE client_id IN (SELECT id FROM clients WHERE email LIKE ${targetDomainPattern})`;

        console.log("Deleting clients...");
        await sql`DELETE FROM clients WHERE email LIKE ${targetDomainPattern}`;

        console.log("Deleting user_roles...");
        await sql`DELETE FROM user_roles WHERE user_id IN (SELECT id::text FROM auth_users WHERE email LIKE ${targetDomainPattern} OR email LIKE 'test+%@dutygrid.test')`;

        console.log("Deleting employees...");
        await sql`DELETE FROM employees WHERE email LIKE ${targetDomainPattern}`;

        console.log("Deleting auth_users...");
        await sql`DELETE FROM auth_users WHERE email LIKE ${targetDomainPattern} OR email LIKE 'test+%@dutygrid.test'`;

        console.log("Success!");
    } catch (e) {
        console.error("DB Error:", e);
    }
}
run();
