import sql from "@/app/api/utils/sql";

/**
 * DELETE /api/availability/exceptions/batch
 * Deletes availability exceptions for a date range (inclusive).
 * Body: { employee_id, start_date, end_date }
 */
export async function DELETE(request) {
    try {
        const body = await request.json();
        const { employee_id, start_date, end_date } = body;

        if (!employee_id || !start_date || !end_date) {
            return Response.json(
                { error: "Missing required fields: employee_id, start_date, end_date" },
                { status: 400 }
            );
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        // Safety check
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
            return Response.json(
                { error: "Range too large. Max 365 days allowed." },
                { status: 400 }
            );
        }

        const result = await sql`
        DELETE FROM availability_exceptions 
        WHERE employee_id = ${employee_id} 
          AND exception_date >= ${start_date}::date 
          AND exception_date <= ${end_date}::date
    `;

        return Response.json({ success: true, count: result.count });

    } catch (error) {
        console.error("Error deleting batch exceptions:", error);
        return Response.json(
            { error: "Failed to delete batch exceptions", details: error.message },
            { status: 500 }
        );
    }
}
