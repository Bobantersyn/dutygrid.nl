import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" });

async function run() {
    const users = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'auth_users'");
    console.log('auth_users columns:', users.rows.map(r => r.column_name));

    const accounts = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'auth_accounts'");
    console.log('auth_accounts columns:', accounts.rows.map(r => r.column_name));

    process.exit(0);
}
run();
