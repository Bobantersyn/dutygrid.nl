import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const users = await sql`
            SELECT id, email, company_name, role 
            FROM auth_users 
            WHERE email LIKE 'test+%'
        `;
        console.log("Users with test+ prefix:", users);
        
        const companiesQuery = await sql`
            SELECT company_name, email FROM auth_users
            WHERE company_name ILIKE '%test%' OR email ILIKE '%test%'
        `;
        console.log("Companies with 'test':", companiesQuery);
    } catch(e) { console.error(e); }
}
run();
