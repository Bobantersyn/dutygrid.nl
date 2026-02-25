import sql from '../src/app/api/utils/sql.js';
async function main() {
  const res = await sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'clients'`;
  console.log(res);
  process.exit(0);
}
main();
