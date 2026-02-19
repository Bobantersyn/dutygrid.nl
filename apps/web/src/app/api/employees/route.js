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

    let query = "SELECT * FROM employees WHERE 1=1";
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
      name,
      email,
      phone,
      home_address,
      city,
      postal_code,
      date_of_birth,
      cao_type,
      max_hours_per_week,
      max_hours_per_day,
      hourly_rate,
      active = true,
    } = body;

    // Use provided name or construct from first/last
    const finalName = name || `${first_name || ""} ${last_name || ""}`.trim();

    if (
      !finalName ||
      !email ||
      !cao_type ||
      !max_hours_per_week ||
      !max_hours_per_day
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const statusValue = active ? "active" : "inactive";

    const [employee] = await sql`
      INSERT INTO employees (
        name, email, phone, address, city, postal_code, date_of_birth,
        cao_type, max_hours_per_week, max_hours_per_day, hourly_rate, status
      ) VALUES (
        ${finalName}, 
        ${email}, 
        ${phone || null}, 
        ${home_address || null}, 
        ${city || null},
        ${postal_code || null},
        ${date_of_birth || null},
        ${cao_type}, 
        ${max_hours_per_week}, 
        ${max_hours_per_day},
        ${hourly_rate || null},
        ${statusValue}
      )
      RETURNING *
    `;

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
