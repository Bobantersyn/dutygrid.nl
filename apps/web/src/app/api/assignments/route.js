import sql from "@/app/api/utils/sql";

// Haal alle opdrachten op
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    let query = `
      SELECT a.*, c.name as client_name,
        COALESCE(
          (SELECT json_agg(json_build_object('id', ol.id, 'name', ol.name))
           FROM assignment_object_labels aol
           JOIN object_labels ol ON aol.object_label_id = ol.id
           WHERE aol.assignment_id = a.id), 
        '[]'::json) as object_labels
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
      object_labels = [], // Array of label IDs
    } = await request.json();

    if (!client_id || !location_name || !location_address) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const status_val = active !== false ? 'active' : 'inactive';
    const [assignment] = await sql`
      INSERT INTO assignments (client_id, name, address, description, status)
      VALUES (${client_id}, ${location_name}, ${location_address}, ${description || null}, ${status_val})
      RETURNING *
    `;

    // Process object labels
    if (object_labels.length > 0) {
      await Promise.all(
        object_labels.map((labelId) =>
          sql`INSERT INTO assignment_object_labels (assignment_id, object_label_id) VALUES (${assignment.id}, ${labelId})`
        )
      );
    }

    return Response.json({ assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return Response.json(
      { error: "Failed to create assignment" },
      { status: 500 },
    );
  }
}
