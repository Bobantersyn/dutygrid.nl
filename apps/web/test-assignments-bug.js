import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);

async function test() {
  try {
    const clients = await sql`SELECT id FROM clients LIMIT 1`;
    if (clients.length === 0) { console.log('No clients available to test'); return; }

    const client_id = clients[0].id;
    console.log(`Using client_id: ${client_id}`);

    const [assignment] = await sql`
      INSERT INTO assignments (client_id, name, address, description, status)
      VALUES (${client_id}, 'Test Bug Location', 'Test Address', null, 'active')
      RETURNING *
    `;
    console.log("Insert Success:", assignment);

  } catch (err) {
    console.error("SQL ERROR ENCOUNTERED:", err.message);
  }
}

test();
