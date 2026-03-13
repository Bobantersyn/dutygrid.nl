import sql from '@/app/api/utils/sql';
import { getSession } from '@/utils/session';

export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const leaveId = params.id;
        const body = await request.json();
        const { status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return Response.json({ error: 'Invalid status update' }, { status: 400 });
        }

        // Must be an admin or planner to approve/reject
        const userRoleResult = await sql`
            SELECT role 
            FROM user_roles 
            WHERE user_id = ${userId}
            LIMIT 1
        `;

        const role = userRoleResult[0]?.role;
        if (role !== 'admin' && role !== 'planner') {
            return Response.json({ error: 'Only planners and admins can review leave requests' }, { status: 403 });
        }

        // Check if request exists and get its details
        const leaveResult = await sql`
            SELECT * FROM leave_requests WHERE id = ${leaveId}
        `;

        if (leaveResult.length === 0) {
            return Response.json({ error: 'Leave request not found' }, { status: 404 });
        }

        const leaveReq = leaveResult[0];

        // Update the request status
        await sql`
            UPDATE leave_requests 
            SET status = ${status}, reviewed_by = ${userId}, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ${leaveId}
        `;

        // AUTOMATION: If approved, we MUST block their calendar in availability_exceptions
        if (status === 'approved') {
            const startDate = new Date(leaveReq.start_date);
            const endDate = new Date(leaveReq.end_date);

            // Generate all dates between start and end (inclusive)
            const datesToBlock = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                datesToBlock.push(new Date(d));
            }

            // Execute all insertions inside a single transaction logic block
            try {
                // To avoid multiple round trips, we construct the insert logic with a subquery
                for (const d of datesToBlock) {
                    const dateString = d.toISOString().split('T')[0];
                    const reason = `Goedgekeurd: ${leaveReq.type === 'ziek' ? 'Ziekmelding' : 'Vakantie'}`;

                    await sql`
                        INSERT INTO availability_exceptions (employee_id, date, is_available, reason)
                        SELECT ${leaveReq.employee_id}, ${dateString}, false, ${reason}
                        WHERE NOT EXISTS (
                            SELECT 1 FROM availability_exceptions 
                            WHERE employee_id = ${leaveReq.employee_id} AND date = ${dateString}
                        )
                    `;
                }
            } catch (err) {
                console.error('[Leave API] Error generating exceptions:', err);
            }
        }

        // Notify the employee
        try {
            // Find employee's auth_user ID
            const empUserIdRes = await sql`
                SELECT au.id 
                FROM auth_users au
                JOIN user_roles ur ON au.id = ur.user_id
                WHERE ur.employee_id = ${leaveReq.employee_id}
                LIMIT 1
            `;

            if (empUserIdRes.length > 0) {
                const title = status === 'approved' ? 'Verlof Goedgekeurd' : 'Verlof Afgewezen';
                const message = status === 'approved'
                    ? 'Je aanvraag is goedgekeurd. Deze dagen zijn nu geblokkeerd in de planning.'
                    : 'Je aanvraag is helaas afgewezen door de planning.';

                await sql`
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES (${empUserIdRes[0].id}, ${title}, ${message}, 'leave_update')
                `;
            }
        } catch (notifErr) {
            console.warn('[Leave Requests PATCH] Notification insert failed:', notifErr);
        }

        return Response.json({ success: true, status });

    } catch (error) {
        console.error('[Leave Requests PATCH] Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
