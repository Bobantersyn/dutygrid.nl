import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

// Haal alle medewerkers op met optionele filters
export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const caoType = searchParams.get("cao_type");
    const active = searchParams.get("active");

    let query = `
      SELECT e.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', ol.id, 'name', ol.name))
           FROM employee_object_labels eol
           JOIN object_labels ol ON eol.object_label_id = ol.id
           WHERE eol.employee_id = e.id), 
        '[]'::json) as object_labels
      FROM employees e WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (caoType && caoType !== "all") {
      query += ` AND cao_type = $${paramIndex}`;
      values.push(caoType);
      paramIndex++;
    }

    if (active !== null && active !== undefined && active !== "all") {
      const statusValue = active === "true" ? "active" : "inactive";
      query += ` AND status = $${paramIndex}`;
      values.push(statusValue);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const employees = await sql(query, values);
    return Response.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return Response.json(
      { error: "Failed to fetch employees" },
      { status: 500 },
    );
  }
}

// Maak nieuwe medewerker aan
export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      home_address,
      city,
      postal_code,
      date_of_birth,
      hourly_rate,
      pass_type = 'geen',
      is_flex = false,
      profile_photo,
      active = true,
      object_labels = [],
    } = body;

    const finalName = `${first_name || ""} ${last_name || ""}`.trim();

    if (!first_name || !last_name || !email) {
      return Response.json(
        { error: "Niet alle verplichte velden (Voornaam, Achternaam, Email) zijn ingevuld" },
        { status: 400 },
      );
    }

    const statusValue = active ? "active" : "inactive";

    const [employee] = await sql`
      INSERT INTO employees (
        name, first_name, last_name, email, phone, address, city, postal_code, date_of_birth,
        hourly_rate, status, pass_type, is_flex, profile_photo
      ) VALUES (
        ${finalName}, 
        ${first_name},
        ${last_name},
        ${email}, 
        ${phone || null}, 
        ${home_address || null}, 
        ${city || null},
        ${postal_code || null},
        ${date_of_birth || null},
        ${hourly_rate || null},
        ${statusValue},
        ${pass_type},
        ${is_flex},
        ${profile_photo || null}
      )
      RETURNING *
    `;

    // Process object labels
    if (object_labels.length > 0) {
      const labelValues = object_labels.map(labelId => `(${employee.id}, ${labelId})`).join(", ");
      await sql(`INSERT INTO employee_object_labels (employee_id, object_label_id) VALUES ${labelValues}`);
    }

    return Response.json({ employee }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    if (error.message.includes("duplicate key") || error.message.includes("unique")) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to create employee" },
      { status: 500 },
    );
  }
}
