import sql from "@/app/api/utils/sql";

// Haal alle klanten op
export async function GET(request) {
  try {
    const clients = await sql`
      SELECT * FROM clients 
      ORDER BY name ASC
    `;

    return Response.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// Maak nieuwe klant aan
export async function POST(request) {
  try {
    const { name, contact_person, email, phone, address } =
      await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const [client] = await sql`
      INSERT INTO clients (name, contact_person, email, phone, address)
      VALUES (${name}, ${contact_person || null}, ${email || null}, ${phone || null}, ${address || null})
      RETURNING *
    `;

    return Response.json({ client });
  } catch (error) {
    console.error("Error creating client:", error);
    return Response.json({ error: "Failed to create client" }, { status: 500 });
  }
}
