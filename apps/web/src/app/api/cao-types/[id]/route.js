import sql from "@/app/api/utils/sql";

// Haal specifiek CAO type op
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [caoType] = await sql`
      SELECT * FROM cao_types 
      WHERE id = ${id}
    `;

    if (!caoType) {
      return Response.json({ error: "CAO type not found" }, { status: 404 });
    }

    return Response.json({ caoType });
  } catch (error) {
    console.error("Error fetching CAO type:", error);
    return Response.json(
      { error: "Failed to fetch CAO type" },
      { status: 500 },
    );
  }
}

// Update CAO type
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "max_hours_per_week",
      "max_hours_per_day",
      "description",
      "pdf_document",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Add last_updated timestamp
    fields.push(`last_updated = NOW()`);

    values.push(id);
    const query = `
      UPDATE cao_types 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [caoType] = await sql(query, values);

    if (!caoType) {
      return Response.json({ error: "CAO type not found" }, { status: 404 });
    }

    return Response.json({ caoType });
  } catch (error) {
    console.error("Error updating CAO type:", error);
    return Response.json(
      { error: "Failed to update CAO type" },
      { status: 500 },
    );
  }
}

// Verwijder CAO type (altijd toegestaan)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const [deleted] = await sql`
      DELETE FROM cao_types 
      WHERE id = ${id}
      RETURNING *
    `;

    if (!deleted) {
      return Response.json({ error: "CAO type not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting CAO type:", error);
    return Response.json(
      { error: "Failed to delete CAO type" },
      { status: 500 },
    );
  }
}
