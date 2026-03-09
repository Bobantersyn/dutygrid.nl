import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const rows = await sql`
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                rc.update_rule, 
                rc.delete_rule
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.referential_constraints rc
              ON tc.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND ccu.table_name IN ('auth_users', 'employees', 'clients');
        `;
        console.log("Foreign keys pointing to auth_users, employees, clients:");
        console.table(rows);
    } catch (e) {
        console.error(e);
    }
}
run();
