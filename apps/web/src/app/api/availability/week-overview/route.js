import sql from "@/app/api/utils/sql";

/**
 * GET /api/availability/week-overview
 * Query params: employee_id (optional), week_start (YYYY-MM-DD)
 * Returns availability overview for one or all employees for a given week
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const weekStart = searchParams.get("week_start");

    if (!weekStart) {
      return Response.json(
        { error: "week_start parameter is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // Calculate week dates (Monday to Sunday)
    const startDate = new Date(weekStart);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date.toISOString().split("T")[0]);
    }

    // If employee_id is provided, get single employee
    if (employeeId) {
      const employeeResult = await sql`
        SELECT id, name, can_manage_own_availability, status
        FROM employees
        WHERE id = ${employeeId}
      `;

      if (employeeResult.length === 0) {
        return Response.json({ error: "Employee not found" }, { status: 404 });
      }

      const employee = employeeResult[0];

      // Get patterns if Type A
      let patterns = [];
      if (employee.can_manage_own_availability) {
        patterns = await sql`
          SELECT day_of_week, start_time, end_time, is_available
          FROM availability_patterns
          WHERE employee_id = ${employeeId}
        `;
      }

      // Get exceptions for the week
      const exceptions = await sql`
        SELECT exception_date, is_available, start_time, end_time, reason
        FROM availability_exceptions
        WHERE employee_id = ${employeeId}
          AND exception_date >= ${weekDates[0]}
          AND exception_date <= ${weekDates[6]}
      `;

      // Get Future Leave (if requested)
      const includeFuture = searchParams.get("include_future_leave") === "true";
      let futureLeave = [];

      if (includeFuture) {
        const futureExceptions = await sql`
            SELECT exception_date, is_available, reason, start_time, end_time
            FROM availability_exceptions
            WHERE employee_id = ${employeeId}
              AND exception_date > ${weekDates[6]}
              AND (is_available = false OR is_available IS NULL)
            ORDER BY exception_date ASC
            LIMIT 10
          `;

        futureLeave = futureExceptions.map(ex => ({
          date: ex.exception_date.toISOString().split("T")[0],
          reason: ex.reason,
          is_available: ex.is_available
        }));
      }

      // Build week array
      const week = weekDates.map((date) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        const dayNames = [
          "Zondag",
          "Maandag",
          "Dinsdag",
          "Woensdag",
          "Donderdag",
          "Vrijdag",
          "Zaterdag",
        ];

        // Check exception first
        const exception = exceptions.find(
          (ex) => ex.exception_date.toISOString().split("T")[0] === date,
        );
        if (exception) {
          return {
            date,
            day: dayNames[dayOfWeek],
            available: exception.is_available,
            start_time: exception.start_time
              ? exception.start_time.slice(0, 5)
              : null,
            end_time: exception.end_time
              ? exception.end_time.slice(0, 5)
              : null,
            reason: exception.reason,
            source: "exception",
          };
        }

        // Type A: check pattern
        if (employee.can_manage_own_availability) {
          const pattern = patterns.find((p) => p.day_of_week === dayOfWeek);
          if (pattern && pattern.is_available) {
            return {
              date,
              day: dayNames[dayOfWeek],
              available: true,
              start_time: pattern.start_time.slice(0, 5),
              end_time: pattern.end_time.slice(0, 5),
              reason: null,
              source: "pattern",
            };
          }
          return {
            date,
            day: dayNames[dayOfWeek],
            available: false,
            reason: "Niet opgegeven",
            source: "not_set",
          };
        }

        // Type B: default available
        return {
          date,
          day: dayNames[dayOfWeek],
          available: true,
          reason: null,
          source: "default",
        };
      });

      return Response.json({
        employee: {
          id: employee.id,
          name: employee.name,
          can_manage_own_availability: employee.can_manage_own_availability,
        },
        week,
        future_leave: futureLeave,
      });
    }

    // Get all active employees
    const employees = await sql`
      SELECT id, name, can_manage_own_availability, status
      FROM employees
      WHERE status = 'active'
      ORDER BY name
    `;

    // Get all patterns
    const employeeIds = employees.map((e) => e.id);
    const allPatterns =
      employeeIds.length > 0
        ? await sql`
          SELECT employee_id, day_of_week, start_time, end_time, is_available
          FROM availability_patterns
          WHERE employee_id = ANY(${employeeIds})
        `
        : [];

    // Get all exceptions for the week
    const allExceptions =
      employeeIds.length > 0
        ? await sql`
          SELECT employee_id, exception_date, is_available, start_time, end_time, reason
          FROM availability_exceptions
          WHERE employee_id = ANY(${employeeIds})
            AND exception_date >= ${weekDates[0]}
            AND exception_date <= ${weekDates[6]}
        `
        : [];

    // Build overview for all employees
    const overview = employees.map((employee) => {
      const patterns = allPatterns.filter((p) => p.employee_id === employee.id);
      const exceptions = allExceptions.filter(
        (e) => e.employee_id === employee.id,
      );

      // Calculate availability for this week
      let availableDays = 0;
      let totalDays = 7;

      weekDates.forEach((date) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        // Check exception first
        const exception = exceptions.find(
          (ex) => ex.exception_date.toISOString().split("T")[0] === date,
        );
        if (exception) {
          if (exception.is_available) availableDays++;
          return;
        }

        // Type A: check pattern
        if (employee.can_manage_own_availability) {
          const pattern = patterns.find((p) => p.day_of_week === dayOfWeek);
          if (pattern && pattern.is_available) {
            availableDays++;
          }
          return;
        }

        // Type B: default available
        availableDays++;
      });

      return {
        id: employee.id,
        name: employee.name,
        can_manage_own_availability: employee.can_manage_own_availability,
        available_days: availableDays,
        total_days: totalDays,
        availability_percentage: Math.round((availableDays / totalDays) * 100),
      };
    });

    // Build availability_by_day
    const availabilityByDay = {};
    weekDates.forEach((date) => {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      availabilityByDay[date] = [];

      employees.forEach((employee) => {
        const patterns = allPatterns.filter(
          (p) => p.employee_id === employee.id,
        );
        const exceptions = allExceptions.filter(
          (e) => e.employee_id === employee.id,
        );

        // Check exception first
        const exception = exceptions.find(
          (ex) => ex.exception_date.toISOString().split("T")[0] === date,
        );
        if (exception) {
          availabilityByDay[date].push({
            employee_id: employee.id,
            is_available: exception.is_available,
            reason: exception.reason,
            hours:
              exception.start_time && exception.end_time
                ? `${exception.start_time.slice(0, 5)}-${exception.end_time.slice(0, 5)}`
                : (exception.is_available ? "Hele dag" : null),
          });
          return;
        }

        // Type A: check pattern
        if (employee.can_manage_own_availability) {
          const pattern = patterns.find((p) => p.day_of_week === dayOfWeek);
          if (pattern) {
            availabilityByDay[date].push({
              employee_id: employee.id,
              is_available: pattern.is_available,
              hours: pattern.is_available ? `${pattern.start_time.slice(0, 5)}-${pattern.end_time.slice(0, 5)}` : null,
              reason: pattern.is_available ? null : "Rooster (Niet beschikbaar)",
            });
          } else {
            // Not set
            availabilityByDay[date].push({
              employee_id: employee.id,
              is_available: false,
              reason: "Niet opgegeven",
              hours: null
            });
          }
          return;
        }

        // Type B: default available (hele dag) but check if we want to explicitly say so
        availabilityByDay[date].push({
          employee_id: employee.id,
          is_available: true,
          hours: "Hele dag",
        });
      });
    });

    return Response.json({
      week_start: weekDates[0],
      week_end: weekDates[6],
      employees: overview,
      availability_by_day: availabilityByDay,
    });
  } catch (error) {
    console.error("Error fetching week overview:", error);
    return Response.json(
      { error: "Failed to fetch availability overview", details: error.message },
      { status: 500 },
    );
  }
}
