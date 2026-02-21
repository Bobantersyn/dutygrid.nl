const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon('postgres://default:oT3e6bLURJym@ep-restless-breeze-a2l2yrtw.eu-central-1.aws.neon.tech:5432/verceldb?sslmode=require');
  
  // Checking migrations
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
  console.log("Tables:", tables.map(t => t.table_name).join(', '));
  
  // Check user roles
  const roles = await sql`SELECT * FROM user_roles;`;
  console.log("User roles:", roles);
  
  // Check users
  const users = await sql`SELECT * FROM auth_users;`;
  console.log("Users:", users);
}
run().catch(console.error);
