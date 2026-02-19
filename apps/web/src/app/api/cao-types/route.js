import sql from "@/app/api/utils/sql";

// Haal alle CAO types op
export async function GET(request) {
  try {
    const caoTypes = await sql`
      SELECT * FROM cao_types 
      ORDER BY name ASC
    `;

    return Response.json({ caoTypes });
  } catch (error) {
    console.error("Error fetching CAO types:", error);
    return Response.json(
      { error: "Failed to fetch CAO types" },
      { status: 500 },
    );
  }
}

// Maak nieuw CAO type aan
export async function POST(request) {
  try {
    const {
      name,
      max_hours_per_week,
      max_hours_per_day,
      description,
      pdf_document,
    } = await request.json();

    if (!name || !max_hours_per_week || !max_hours_per_day) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [caoType] = await sql`
      INSERT INTO cao_types (
        name, max_hours_per_week, max_hours_per_day, description, pdf_document
      )
      VALUES (
        ${name}, ${max_hours_per_week}, ${max_hours_per_day}, 
        ${description || null}, ${pdf_document || null}
      )
      RETURNING *
    `;

    return Response.json({ caoType });
  } catch (error) {
    console.error("Error creating CAO type:", error);
    if (error.message.includes("duplicate key")) {
      return Response.json(
        { error: "CAO type with this name already exists" },
        { status: 400 },
      );
    }
    return Response.json(
      { error: "Failed to create CAO type" },
      { status: 500 },
    );
  }
}
