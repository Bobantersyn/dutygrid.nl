import { neon } from '@neondatabase/serverless';

async function run() {
  try {
    const DATABASE_URL = 'postgres://default:oT3e6bLURJym@ep-restless-breeze-a2l2yrtw.eu-central-1.aws.neon.tech:5432/verceldb?sslmode=require';
    const sql = neon(DATABASE_URL);
    
    // Check if table object_labels exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'object_labels';
    `;
    console.log("Tables found:", tables.length);
    if (tables.length > 0) {
      console.log("object_labels table exists.");
    } else {
      console.log("object_labels table DOES NOT EXIST. Migrations were not run on production.");
    }

    // Check employees table columns
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees';
    `;
    const colNames = columns.map(c => c.column_name);
    console.log("Employees columns:", colNames.join(', '));
    if (colNames.includes('first_name')) {
      console.log("first_name exists in employees.");
    } else {
      console.log("first_name DOES NOT EXIST. Phase 5 migration not run.");
    }
  } catch (err) {
    console.error("Error checking db:", err);
  }
}
run();
