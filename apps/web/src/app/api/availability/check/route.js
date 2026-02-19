import sql from "@/app/api/utils/sql";
import { getSession } from "@/utils/session";

// GET - Check of een medewerker beschikbaar is op een datum/tijd
export async function GET(request) {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee_id");
  const date = searchParams.get("date");
  const startTime = searchParams.get("start_time");
  const endTime = searchParams.get("end_time");

  if (!employeeId || !date) {
    return Response.json(
      { error: "employee_id en date zijn verplicht" },
      { status: 400 },
    );
  }

  try {
    // Bepaal de dag van de week (0=Zondag, 1=Maandag, etc.)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Check eerst voor uitzonderingen op deze specifieke datum
    const exceptions = await sql`
      SELECT * FROM availability_exceptions
      WHERE employee_id = ${employeeId}
      AND exception_date = ${date}
    `;

    if (exceptions.length > 0) {
      const exception = exceptions[0];
      return Response.json({
        is_available: exception.is_available,
        reason:
          exception.reason ||
          (exception.is_available ? "Extra beschikbaar" : "Niet beschikbaar"),
        source: "exception",
      });
    }

    // Check het standaard weekpatroon
    const patterns = await sql`
      SELECT * FROM availability_patterns
      WHERE employee_id = ${employeeId}
      AND day_of_week = ${dayOfWeek}
    `;

    if (patterns.length === 0) {
      return Response.json({
        is_available: false,
        reason: "Geen beschikbaarheid ingesteld voor deze dag",
        source: "pattern",
      });
    }

    // Als we start/end tijd hebben, check of de shift binnen de beschikbare tijd valt
    if (startTime && endTime) {
      const matchingPattern = patterns.find((p) => {
        const patternStart = p.start_time.slice(0, 5);
        const patternEnd = p.end_time.slice(0, 5);
        return startTime >= patternStart && endTime <= patternEnd;
      });

      if (!matchingPattern) {
        return Response.json({
          is_available: false,
          reason: `Beschikbaar van ${patterns[0].start_time.slice(0, 5)} tot ${patterns[0].end_time.slice(0, 5)}`,
          source: "pattern",
          available_times: patterns.map((p) => ({
            start: p.start_time.slice(0, 5),
            end: p.end_time.slice(0, 5),
          })),
        });
      }
    }

    return Response.json({
      is_available: true,
      reason: "Beschikbaar",
      source: "pattern",
      available_times: patterns.map((p) => ({
        start: p.start_time.slice(0, 5),
        end: p.end_time.slice(0, 5),
      })),
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
