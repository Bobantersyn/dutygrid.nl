import { hash } from 'argon2';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" });

async function run() {
  const email = 'roland@dutygrid.nl';
  const newPasswordStr = 'DutyGrid2026!';
  const hashedPassword = await hash(newPasswordStr);
  
  const userRes = await pool.query('SELECT id FROM auth_users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) {
    console.log('User not found!');
  } else {
    const userId = userRes.rows[0].id;
    await pool.query('UPDATE auth_accounts SET password = $1 WHERE "userId" = $2 AND provider = \'credentials\'', [hashedPassword, userId]);
    console.log('Password updated to: ' + newPasswordStr);
  }
  process.exit(0);
}
run();
