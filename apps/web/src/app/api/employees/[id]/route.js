import sql from "@/app/api/utils/sql";

// Haal specifieke medewerker op
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [employee] = await sql`
      SELECT e.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', ol.id, 'name', ol.name))
           FROM employee_object_labels eol
           JOIN object_labels ol ON eol.object_label_id = ol.id
           WHERE eol.employee_id = e.id), 
        '[]'::json) as object_labels
      FROM employees e WHERE id = ${id}
    `;

    if (!employee) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    return Response.json({ employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return Response.json(
      { error: "Failed to fetch employee" },
      { status: 500 },
    );
  }
}

// Update medewerker
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "first_name",
      "last_name",
      "name",
      "email",
      "phone",
      "home_address",
      "cao_type",
      "max_hours_per_week",
      "max_hours_per_day",
      "profile_photo",
      "passport_document",
      "security_pass_document",
      "job_title",
      "contract_type",
      "badge_type",
      "is_flexible",
      "active",
      "planning_visibility_weeks",
      "can_manage_own_availability",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(body[field]);
      }
    }

    // Auto-update name if first_name or last_name changed
    if (body.first_name !== undefined || body.last_name !== undefined) {
      const [current] =
        await sql`SELECT first_name, last_name FROM employees WHERE id = ${id}`;
      const newFirstName =
        body.first_name !== undefined
          ? body.first_name
          : current?.first_name || "";
      const newLastName =
        body.last_name !== undefined
          ? body.last_name
          : current?.last_name || "";
      const fullName = `${newFirstName} ${newLastName}`.trim();

      // Only add if not already in updates
      if (body.name === undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(fullName);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const [employee] = await sql(
      `UPDATE employees SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (!employee) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    // Process object labels
    if (body.object_labels !== undefined) {
      // Delete old mapping
      await sql`DELETE FROM employee_object_labels WHERE employee_id = ${id}`;
      // Insert new mapping
      if (body.object_labels.length > 0) {
        const labelValues = body.object_labels.map(labelId => `(${id}, ${labelId})`).join(", ");
        await sql(`INSERT INTO employee_object_labels (employee_id, object_label_id) VALUES ${labelValues}`);
      }
    }

    return Response.json({ employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    return Response.json(
      { error: "Failed to update employee" },
      { status: 500 },
    );
  }
}

// Verwijder medewerker
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const [employee] = await sql`
      DELETE FROM employees WHERE id = ${id} RETURNING *
    `;

    if (!employee) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return Response.json(
      { error: "Failed to delete employee" },
      { status: 500 },
    );
  }
}
