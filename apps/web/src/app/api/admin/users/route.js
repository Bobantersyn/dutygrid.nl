import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";
import { hash } from "argon2";
import { getAdminLimit } from "@/utils/feature-flags";

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
      LEFT JOIN user_roles r ON u.id = r.user_id::integer
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

        // 1. Enforce Admin Limits
        if (role === 'admin' || role === 'planner') {
            try {
                // Get current user's subscription status
                const currentUsers = await sql`SELECT subscription_status FROM auth_users WHERE id = ${session.user.id}`;
                const subStatus = currentUsers[0]?.subscription_status || 'trialing';
                const limit = getAdminLimit(subStatus);

                // Count existing admins and planners
                const countRes = await sql`SELECT COUNT(*) as count FROM user_roles WHERE role IN ('admin', 'planner')`;
                const adminCount = parseInt(countRes[0].count, 10);

                if (adminCount >= limit) {
                    return Response.json({
                        error: `Beheerderslimiet bereikt. Jouw pakket (${subStatus}) staat maximaal ${limit} beheerder(s) toe. Upgrade om meer beheerders toe te voegen.`
                    }, { status: 403 });
                }
            } catch (err) {
                console.error("Error checking admin limits:", err);
            }
        }

        // 2. Create Auth User
        const hashedPassword = await hash(password);

        const [user] = await sql`
      INSERT INTO auth_users(name, email, password, created_at, updated_at)
      VALUES(${name}, ${email}, ${hashedPassword}, NOW(), NOW())
      RETURNING id
                        `;

        // 3. Try to find an existing employee with this email
        const [existingEmployee] = await sql`SELECT id FROM employees WHERE email = ${email}`;
        let linkedEmployeeId = existingEmployee ? existingEmployee.id : null;

        // 4. If role is guard and no employee exists, create one
        if (!linkedEmployeeId && (role === 'beveiliger' || role === 'beveiliger_extended')) {
            const [newEmp] = await sql`
                INSERT INTO employees(name, first_name, last_name, email, hourly_rate, active)
                VALUES(${name}, split_part(${name}, ' ', 1), substring(${name} from position(' ' in ${name}) + 1), ${email}, 0, true)
                RETURNING id
                        `;
            linkedEmployeeId = newEmp?.id;
        }

        // 5. Assign Role
        if (role) {
            await sql`
                INSERT INTO user_roles(user_id, role, employee_id)
                VALUES(${user.id}, ${role}, ${linkedEmployeeId})
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
