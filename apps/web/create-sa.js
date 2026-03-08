import { hash } from 'argon2';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" });

async function run() {
    const email = 'roland@dutygrid.nl';
    const name = 'Roland Antersyn';
    const newPasswordStr = 'Welkom123!';
    const hashedPassword = await hash(newPasswordStr);

    try {
        const userRes = await pool.query(`
      INSERT INTO auth_users (email, name, "emailVerified")
      VALUES ($1, $2, NOW())
      ON CONFLICT (email) DO UPDATE SET "emailVerified" = NOW()
      RETURNING id
    `, [email, name]);

        const userId = userRes.rows[0].id;

        await pool.query(`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES ($1, 'credentials', 'credentials', $2, $3)
      ON CONFLICT ("provider", "providerAccountId") DO UPDATE SET password = EXCLUDED.password
    `, [userId, email, hashedPassword]);

        console.log(`✅ Super Admin account created!\nEmail: ${email}\nPassword: ${newPasswordStr}`);
    } catch (err) {
        console.error('Error creating account:', err);
    }
    process.exit(0);
}
run();
