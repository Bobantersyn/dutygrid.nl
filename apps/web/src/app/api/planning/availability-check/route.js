import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!startDate || !endDate) {
      return Response.json(
        { error: "start_date and end_date are required" },
        { status: 400 },
      );
    }

    // Get all employees with their availability patterns and exceptions
    const availabilityByDay = await sql`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS check_date
      ),
      employee_availability AS (
        SELECT 
          e.id AS employee_id,
          e.name AS employee_name,
          ds.check_date,
          EXTRACT(DOW FROM ds.check_date) AS day_of_week,
          -- Check for exceptions first (they override patterns)
          COALESCE(
            ae.is_available,
            ap.is_available,
            false
          ) AS is_available,
          ap.start_time,
          ap.end_time,
          ae.reason AS exception_reason
        FROM employees e
        CROSS JOIN date_series ds
        LEFT JOIN availability_patterns ap 
          ON ap.employee_id = e.id 
          AND ap.day_of_week = EXTRACT(DOW FROM ds.check_date)
          AND ap.is_available = true
        LEFT JOIN availability_exceptions ae 
          ON ae.employee_id = e.id 
          AND ae.exception_date = ds.check_date
        WHERE e.active = true
      ),
      shifts_count AS (
        SELECT 
          shift_date,
          COUNT(*) AS shifts_scheduled
        FROM shifts
        WHERE shift_date >= ${startDate}::date 
          AND shift_date <= ${endDate}::date
        GROUP BY shift_date
      )
      SELECT 
        ea.check_date,
        COUNT(*) FILTER (WHERE ea.is_available = true) AS available_count,
        COALESCE(sc.shifts_scheduled, 0) AS shifts_scheduled,
        json_agg(
          json_build_object(
            'employee_id', ea.employee_id,
            'employee_name', ea.employee_name,
            'is_available', ea.is_available,
            'start_time', ea.start_time,
            'end_time', ea.end_time,
            'exception_reason', ea.exception_reason
          )
          ORDER BY ea.employee_name
        ) FILTER (WHERE ea.is_available = true) AS available_employees
      FROM employee_availability ea
      LEFT JOIN shifts_count sc ON sc.shift_date = ea.check_date
      GROUP BY ea.check_date, sc.shifts_scheduled
      ORDER BY ea.check_date
    `;

    return Response.json({ availability: availabilityByDay });
  } catch (error) {
    console.error("Error checking availability:", error);
    return Response.json(
      { error: "Failed to check availability" },
      { status: 500 },
    );
  }
}
