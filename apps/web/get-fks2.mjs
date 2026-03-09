import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    try {
        const checkTable = async (tableName) => {
            const rows = await sql`
                SELECT
                    tc.table_name, 
                    kcu.column_name, 
                    rc.delete_rule
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                    JOIN information_schema.referential_constraints rc
                      ON tc.constraint_name = rc.constraint_name
                WHERE ccu.table_name = ${tableName};
            `;
            console.log(`Foreign keys pointing to ${tableName}:`, rows);
        };
        await checkTable('employees');
        await checkTable('clients');
        await checkTable('assignments');
    } catch (e) { console.error(e); }
}
run();
