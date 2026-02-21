import sql from "@/app/api/utils/sql";

// Verwijder opdracht
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const [assignment] = await sql`
      DELETE FROM assignments WHERE id = ${id} RETURNING *
    `;

    if (!assignment) {
      return Response.json({ error: "Assignment not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return Response.json(
      { error: "Failed to delete assignment" },
      { status: 500 },
    );
  }
}

// Update opdracht (toggle active status)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (body.active !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(body.active ? 'active' : 'inactive');
    }
    if (body.location_name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(body.location_name);
    }
    if (body.location_address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(body.location_address);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(body.description);
    }
    if (body.hourly_rate !== undefined) {
      updates.push(`hourly_rate = $${paramCount++}`);
      values.push(body.hourly_rate);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const [assignment] = await sql(
      `UPDATE assignments SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (!assignment) {
      return Response.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Process object labels
    if (body.object_labels !== undefined) {
      // Delete old mapping
      await sql`DELETE FROM assignment_object_labels WHERE assignment_id = ${id}`;
      // Insert new mapping
      if (body.object_labels.length > 0) {
        const labelValues = body.object_labels.map(labelId => `(${id}, ${labelId})`).join(", ");
        await sql(`INSERT INTO assignment_object_labels (assignment_id, object_label_id) VALUES ${labelValues}`);
      }
    }

    return Response.json({ assignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return Response.json(
      { error: "Failed to update assignment" },
      { status: 500 },
    );
  }
}
