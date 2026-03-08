import pg from 'pg';
import { hash } from 'argon2';
const { Pool } = pg;
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" });

async function run() {
    const email = 'roland@dutygrid.nl';
    const newPasswordStr = 'Welkom123!';
    const hashedPassword = await hash(newPasswordStr);

    await pool.query(`
    UPDATE auth_users SET password = $1 WHERE email = $2
  `, [hashedPassword, email]);

    console.log('Password updated on auth_users table!');
    process.exit(0);
}
run();
