import sql from "@/app/api/utils/sql";

// Haal opgeslagen patronen op
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");

    if (!employeeId) {
      return Response.json(
        { error: "employee_id is required" },
        { status: 400 },
      );
    }

    const patterns = await sql`
      SELECT id, pattern_name, pattern_data, created_at
      FROM saved_availability_patterns
      WHERE employee_id = ${employeeId}
      ORDER BY created_at DESC
    `;

    return Response.json({ patterns });
  } catch (error) {
    console.error("Error fetching saved patterns:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Sla een nieuw patroon op
export async function POST(request) {
  try {
    const { employee_id, pattern_name, pattern_data } = await request.json();

    if (!employee_id || !pattern_name || !pattern_data) {
      return Response.json(
        { error: "employee_id, pattern_name, and pattern_data are required" },
        { status: 400 },
      );
    }

    const [newPattern] = await sql`
      INSERT INTO saved_availability_patterns (employee_id, pattern_name, pattern_data)
      VALUES (${employee_id}, ${pattern_name}, ${JSON.stringify(pattern_data)})
      RETURNING id, pattern_name, pattern_data, created_at
    `;

    return Response.json({ pattern: newPattern });
  } catch (error) {
    console.error("Error saving pattern:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Verwijder een opgeslagen patroon
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    await sql`
      DELETE FROM saved_availability_patterns
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting pattern:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
