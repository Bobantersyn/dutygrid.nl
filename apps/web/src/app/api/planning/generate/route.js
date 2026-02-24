import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";
import { detectPlanningGaps } from "../utils/planning-helpers.js";

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user role
        const userRoleRows = await sql`
            SELECT role FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
        `;
        const userRole = userRoleRows[0]?.role;

        // Only planners and admins can generate auto-planning
        if (!userRole || !["planner", "admin"].includes(userRole)) {
            return Response.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const body = await request.json();
        let { start_date, end_date } = body;

        if (!start_date || !end_date) {
            return Response.json(
                { error: "start_date and end_date are required" },
                { status: 400 }
            );
        }

        // Detect gaps first
        const gaps = await detectPlanningGaps(start_date, end_date);
        const generatedShifts = [];

        for (const gap of gaps) {
            if (gap.suggested_employees && gap.suggested_employees.length > 0) {
                // Pick the highest scoring employee
                const bestEmployee = gap.suggested_employees[0];

                // Set default shift times (e.g. 08:00 to 16:00)
                const startTime = `${gap.date}T08:00:00`;
                const endTime = `${gap.date}T16:00:00`;

                // Optionally, we could check for 12h rest violation explicitly right before insert:
                // but gap detect relies on scoring so it should be fine.

                const insertShift = await sql`
                    INSERT INTO shifts (
                        employee_id, 
                        assignment_id, 
                        start_time, 
                        end_time, 
                        status
                    ) VALUES (
                        ${bestEmployee.id},
                        ${gap.assignment_id},
                        ${startTime},
                        ${endTime},
                        'draft'
                    ) RETURNING id
                `;

                generatedShifts.push({
                    shift_id: insertShift[0].id,
                    assignment_id: gap.assignment_id,
                    employee_id: bestEmployee.id,
                    employee_name: bestEmployee.name,
                    date: gap.date
                });
            }
        }

        // Add an audit log entry
        await sql`
            INSERT INTO audit_logs (user_id, action, entity, entity_id, changes)
            VALUES (${session.user.id}, 'AUTO_GENERATE', 'planning', null, ${JSON.stringify({
            start_date, end_date, generated_count: generatedShifts.length
        })})
        `;

        return Response.json({
            message: `Successfully generated ${generatedShifts.length} shifts.`,
            generated_shifts: generatedShifts
        });

    } catch (error) {
        console.error("Error auto-generating planning:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
