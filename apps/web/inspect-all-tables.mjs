import { neon } from '@neondatabase/serverless';

async function run() {
    try {
        const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
        const sql = neon(DATABASE_URL);

        for (const table of ['assignments', 'notifications']) {
            console.log(`\nChecking ${table} schema:`);
            const schema = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = ${table};
            `;
            console.log(JSON.stringify(schema, null, 2));
        }
    } catch (error) {
        console.error("DB Inspector Error:", error);
    }
}

run();
