import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" });

async function run() {
    const users = await pool.query('SELECT email FROM auth_users LIMIT 10');
    console.log('Existing users:', users.rows);
    process.exit(0);
}
run();
