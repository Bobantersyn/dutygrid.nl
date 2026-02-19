import sql from "@/app/api/utils/sql";

// Haal alle opdrachten op
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    let query = `
      SELECT a.*, c.name as client_name 
      FROM assignments a 
      LEFT JOIN clients c ON a.client_id = c.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (clientId) {
      query += ` AND a.client_id = $${paramCount++}`;
      values.push(clientId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const assignments = await sql(query, values);

    return Response.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return Response.json(
      { error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

// Maak nieuwe opdracht aan
export async function POST(request) {
  try {
    const {
      client_id,
      location_name,
      location_address,
      description,
      hourly_rate,
      active,
    } = await request.json();

    if (!client_id || !location_name || !location_address) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [assignment] = await sql`
      INSERT INTO assignments (client_id, location_name, location_address, description, hourly_rate, active)
      VALUES (${client_id}, ${location_name}, ${location_address}, ${description || null}, ${hourly_rate || null}, ${active !== false})
      RETURNING *
    `;

    return Response.json({ assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return Response.json(
      { error: "Failed to create assignment" },
      { status: 500 },
    );
  }
}
