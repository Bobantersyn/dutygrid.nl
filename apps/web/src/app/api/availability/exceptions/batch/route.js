import sql from "@/app/api/utils/sql";

/**
 * POST /api/availability/exceptions/batch
 * Creates availability exceptions for a date range (inclusive).
 * Body: { employee_id, start_date, end_date, is_available: false, reason }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { employee_id, start_date, end_date, is_available, reason } = body;

        if (!employee_id || !start_date || !end_date) {
            return Response.json(
                { error: "Missing required fields: employee_id, start_date, end_date" },
                { status: 400 }
            );
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        // Safety check: Don't allow massive ranges by accident (e.g. 10 years)
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
            return Response.json(
                { error: "Range too large. Max 365 days allowed." },
                { status: 400 }
            );
        }

        // Generate dates array
        const dates = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Insert or Update for each date
        // Safer approach: DELETE existing for this day, then INSERT.
        // This avoids missing UNIQUE constraints causing errors.

        const results = [];
        for (const dateStr of dates) {
            // 1. Delete existing exception for this day
            await sql`
                DELETE FROM availability_exceptions 
                WHERE employee_id = ${employee_id} AND date = ${dateStr}
            `;

            // 2. Insert new exception
            const result = await sql`
                INSERT INTO availability_exceptions 
                (employee_id, date, exception_date, is_available, reason, start_time, end_time)
                VALUES (${employee_id}, ${dateStr}, ${dateStr}, ${is_available}, ${reason}, null, null)
                RETURNING *
            `;
            results.push(result[0]);
        }

        return Response.json({ success: true, count: results.length, data: results });

    } catch (error) {
        console.error("Error creating batch exceptions:", error);
        return Response.json(
            { error: "Failed to create batch exceptions", details: error.message },
            { status: 500 }
        );
    }
}
