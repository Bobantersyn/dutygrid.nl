import { neon } from '@neondatabase/serverless';
const DATABASE_URL = 'postgresql://neondb_owner:npg_FvVmXrn2uxZ0@ep-rough-resonance-ahvzpgnk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);
async function test() {
  try {
    const res = await sql`SELECT 'Valid Session' as status, s.*, u.id as u_id, u.email, u.name, u.image
      FROM auth_sessions s
      JOIN auth_users u ON s."userId" = u.id
      WHERE s.expires > NOW()
      LIMIT 1`;
    console.log('Test session query:', res);
  } catch (err) {
    console.error('Test Error:', err);
  }
}
test();
