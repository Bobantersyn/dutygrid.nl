import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

export async function PUT(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status } = body; // 'approved' or 'rejected' or 'withdrawn'

        if (!["approved", "rejected", "withdrawn"].includes(status)) {
            return Response.json({ error: "Invalid status" }, { status: 400 });
        }

        // Get user role
        const userRoleRows = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
        const userRole = userRoleRows[0]?.role;
        const linkedEmployeeId = userRoleRows[0]?.employee_id;

        // Check permissions
        // Planner/Admin: Can approve/reject any
        // Employee: Can only 'withdrawn' their own IF it is still pending
        const [existingRequest] = await sql`SELECT * FROM leave_requests WHERE id = ${id}`;

        if (!existingRequest) {
            return Response.json({ error: "Request not found" }, { status: 404 });
        }

        if (status === 'withdrawn') {
            if (existingRequest.employee_id !== linkedEmployeeId && !["planner", "admin"].includes(userRole)) {
                return Response.json({ error: "Unauthorized" }, { status: 403 });
            }
            // Can only withdraw if pending or approved? Usually pending.
            // If approved, withdrawing implies cancellation, which might need to remove exception.
            // For now, allow withdraw anytime, but we must cleanup if approved.
        } else {
            // Approve/Reject
            if (!["planner", "admin"].includes(userRole)) {
                return Response.json({ error: "Only planners can approve/reject" }, { status: 403 });
            }
        }

        // UPDATE STATUS
        const [updatedRequest] = await sql`
      UPDATE leave_requests 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        // SYNC WITH AVAILABILITY_EXCEPTIONS
        if (status === 'approved') {
            // Create exception
            // We need to iterate dates if exception table requires single dates?
            // Based on fix-schema.js: availability_exceptions has start_time, end_time, exception_date (singular).
            // If leave is multiple days, we need multiple records.

            const startDate = new Date(updatedRequest.start_date);
            const endDate = new Date(updatedRequest.end_date);

            // Loop through dates
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];

                await sql`
          INSERT INTO availability_exceptions (
            employee_id, exception_date, is_available, reason, start_time, end_time
          ) VALUES (
            ${updatedRequest.employee_id},
            ${dateStr},
            FALSE,
            ${`Verlof: ${updatedRequest.type}`},
            '00:00:00',
            '23:59:59'
          )
        `;
            }
        } else if (status === 'withdrawn' || status === 'rejected') {
            // If we are rejecting/withdrawing a previously approved request, we should remove the exceptions.
            // BUT current scope implies strict flow: Pending -> Approved/Rejected.
            // If we allow withdrawing an Approved request, we must delete exceptions.
            if (existingRequest.status === 'approved') {
                const startDate = new Date(existingRequest.start_date);
                const endDate = new Date(existingRequest.end_date);

                // Delete exceptions for this range that match the reason pattern? 
                // Or strictly by date/employee.
                // Risk: Deleting other manual exceptions. 
                // Ideally we link them, but we didn't add a column.
                // Practical approach: Delete unavailabilities in this range for this employee with reason matching.

                const reasonPattern = `Verlof: ${existingRequest.type}`;

                // We'll proceed with simple implementation for now.
                // If status changes FROM approved TO something else, warn or handle.
                // For now, let's assume we clean up based on date + employee + reason.

                await sql`
            DELETE FROM availability_exceptions 
            WHERE employee_id = ${existingRequest.employee_id}
            AND exception_date >= ${existingRequest.start_date}
            AND exception_date <= ${existingRequest.end_date}
            AND reason = ${reasonPattern}
         `;
            }
        }

        return Response.json({ request: updatedRequest });

    } catch (error) {
        console.error("Error updating leave request:", error);
        return Response.json({ error: "Failed to update request" }, { status: 500 });
    }
}
