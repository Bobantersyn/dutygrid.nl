import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

// GET: List all users
export async function GET(request) {
    const session = await getSession(request);
    // TODO: Admin check
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const users = await sql`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        r.role as user_role,
        e.id as employee_id, e.hourly_rate
      FROM auth_users u
      LEFT JOIN user_roles r ON u.id = r.user_id
      LEFT JOIN employees e ON u.email = e.email
      ORDER BY u.created_at DESC
    `;
        return Response.json(users);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new user
export async function POST(request) {
    const session = await getSession(request);
    // TODO: Admin check
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!email || !password || !name) {
            return Response.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Create Auth User
        const hashedPassword = await hash(password);

        const [user] = await sql`
      INSERT INTO auth_users (name, email, password, created_at, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, NOW(), NOW())
      RETURNING id
    `;

        // 2. Assign Role
        if (role) {
            await sql`
        INSERT INTO user_roles (user_id, role)
        VALUES (${user.id}, ${role})
      `;
        }

        // 3. If role is guard or planner, verify/create employee record?
        // For now, we assume 'employees' table is sync-ed by email. 
        // Ideally we should create an employee record if role is 'beveiliger'.
        if (role === 'beveiliger' || role === 'beveiliger_extended') {
            await sql`
         INSERT INTO employees (name, email, hourly_rate, status)
         VALUES (${name}, ${email}, 0, 'active')
         ON CONFLICT (email) DO NOTHING
       `;
        }

        return Response.json({ success: true, userId: user.id });
    } catch (error) {
        console.error("Create User Error:", error);
        if (error.code === '23505') { // Unique violation
            return Response.json({ error: "Email already exists" }, { status: 409 });
        }
        return Response.json({ error: error.message }, { status: 500 });
    }
}
