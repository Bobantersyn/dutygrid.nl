import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const users = await sql`
            SELECT id, email, company_name, role 
            FROM auth_users 
            WHERE email LIKE '%@%.dutygrid-staging.local' 
               OR email LIKE 'test+%@dutygrid.test'
        `;
        console.log("Remaining Test Users:", users);
        
        const companiesQuery = await sql`
            SELECT company_name, email FROM auth_users
        `;
        // console.log("All Companies:", companiesQuery.slice(0, 10)); // just sample
    } catch(e) { console.error(e); }
}
run();
