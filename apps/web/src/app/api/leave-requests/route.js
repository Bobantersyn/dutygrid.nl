import sql from '@/app/api/utils/sql';
import { getSession } from '@/utils/session';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const url = new URL(request.url);
        const employeeId = url.searchParams.get('employeeId'); // Explicit filter if admin wants a specific user

        // First find out what role this user has and their associated employee_id
        const userRoleResult = await sql`
            SELECT role, employee_id 
            FROM user_roles 
            WHERE user_id = ${userId}
            LIMIT 1
        `;

        if (userRoleResult.length === 0) {
            return Response.json({ error: 'User role not found' }, { status: 403 });
        }

        const { role, employee_id: myEmployeeId } = userRoleResult[0];
        const isManager = role === 'admin' || role === 'planner';

        // Get tenant's employees to filter by
        const companyNameResult = await sql`SELECT company_name FROM auth_users WHERE id = ${userId}`;
        const companyName = companyNameResult[0]?.company_name;

        // Base Query joining with employee info
        let queryStr = `
            SELECT 
                lr.id, lr.type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at,
                e.name as employee_name, e.id as employee_id
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            JOIN auth_users au ON e.email = au.email OR e.id = (SELECT employee_id FROM user_roles WHERE user_id = au.id LIMIT 1)
        `;
        const queryParams = [];

        // Determine Scoping
        if (isManager) {
            // Managers see all requests from people in their company
            queryStr += ` WHERE au.company_name = $1`;
            queryParams.push(companyName);

            if (employeeId) {
                queryStr += ` AND lr.employee_id = $2`;
                queryParams.push(employeeId);
            }
        } else {
            // Normal employees only see their own
            if (!myEmployeeId) {
                return Response.json({ error: 'No employee profile linked to your account' }, { status: 400 });
            }
            queryStr += ` WHERE lr.employee_id = $1`;
            queryParams.push(myEmployeeId);
        }

        queryStr += ` ORDER BY lr.created_at DESC`;

        // We use string interpolation here safely because queryParams array handles dynamic values
        // Note: the `sql` template literal is our driver, but we can also use `.unsafe` for raw strings with raw params if needed.
        // Actually, let's just stick to the safe `sql` literals.

        let requests = [];
        if (isManager) {
            if (employeeId) {
                requests = await sql`
                    SELECT lr.id, lr.type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at, e.name as employee_name, e.id as employee_id
                    FROM leave_requests lr
                    JOIN employees e ON lr.employee_id = e.id
                    JOIN auth_users au ON e.email = au.email
                    WHERE au.company_name = ${companyName} AND lr.employee_id = ${employeeId}
                    ORDER BY lr.created_at DESC
                `;
            } else {
                requests = await sql`
                    SELECT lr.id, lr.type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at, e.name as employee_name, e.id as employee_id
                    FROM leave_requests lr
                    JOIN employees e ON lr.employee_id = e.id
                    JOIN auth_users au ON e.email = au.email
                    WHERE au.company_name = ${companyName}
                    ORDER BY lr.created_at DESC
                `;
            }
        } else {
            requests = await sql`
                SELECT lr.id, lr.type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at, e.name as employee_name, e.id as employee_id
                FROM leave_requests lr
                JOIN employees e ON lr.employee_id = e.id
                WHERE lr.employee_id = ${myEmployeeId}
                ORDER BY lr.created_at DESC
            `;
        }

        return Response.json(requests);

    } catch (error) {
        console.error('[Leave Requests GET] Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const body = await request.json();
        const { type, startDate, endDate, reason } = body;

        if (!type || !startDate || !endDate) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Must be an employee to request leave
        const userRoleResult = await sql`
            SELECT employee_id 
            FROM user_roles 
            WHERE user_id = ${userId}
            LIMIT 1
        `;

        if (userRoleResult.length === 0 || !userRoleResult[0].employee_id) {
            return Response.json({ error: 'Your account is not linked to an employee profile' }, { status: 400 });
        }

        const employeeId = userRoleResult[0].employee_id;

        // Insert pending request
        const inserted = await sql`
            INSERT INTO leave_requests (employee_id, type, start_date, end_date, reason, status)
            VALUES (${employeeId}, ${type}, ${startDate}, ${endDate}, ${reason || null}, 'pending')
            RETURNING id, type, start_date, end_date, status
        `;

        // Ideally, we'd fire a notification to Planners here
        try {
            const companyResult = await sql`SELECT company_name FROM auth_users WHERE id = ${userId}`;
            const companyName = companyResult[0]?.company_name;

            await sql`
                INSERT INTO notifications (user_id, title, message, type)
                SELECT au.id, 'Nieuwe Verlofaanvraag', 'Er is een nieuwe ' || ${type} || ' aanvraag binnengekomen.', 'leave_request'
                FROM auth_users au
                JOIN user_roles ur ON au.id = ur.user_id
                WHERE au.company_name = ${companyName} AND ur.role IN ('admin', 'planner')
            `;
        } catch (notifErr) {
            console.warn('[Leave Requests POST] Notification insert failed:', notifErr);
        }

        return Response.json({ success: true, data: inserted[0] });

    } catch (error) {
        console.error('[Leave Requests POST] Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
