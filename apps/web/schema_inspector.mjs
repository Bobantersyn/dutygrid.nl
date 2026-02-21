import { neon } from '@neondatabase/serverless';

async function run() {
    try {
        const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
        const sql = neon(DATABASE_URL);

        console.log("Checking auth_users schema:");
        const auth_users_schema = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'auth_users';
        `;
        console.log(JSON.stringify(auth_users_schema, null, 2));

        console.log("\nChecking user_roles schema:");
        const user_roles_schema = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_roles';
        `;
        console.log(JSON.stringify(user_roles_schema, null, 2));

        console.log("\nChecking employees schema:");
        const employees_schema = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'employees';
        `;
        console.log(JSON.stringify(employees_schema, null, 2));

    } catch (error) {
        console.error("DB Inspector Error:", error);
    }
}

run();
