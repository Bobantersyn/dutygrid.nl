import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";
import { hasFeatureAccess } from "@/utils/feature-flags";

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export async function GET(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Check role: Only Planner/Admin/Owner
    // Simplified check for now
    // TODO: Add strict role check

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const employeeId = searchParams.get("employee_id");

    try {
        let query = `
      SELECT 
        s.id, s.start_time, s.end_time, s.break_minutes,
        s.start_time as shift_date, -- Alias for frontend compatibility
        s.actual_start_time, s.actual_end_time, s.actual_break_minutes,
        s.status, s.notes, s.admin_notes,
        s.is_geofence_violation, s.geofence_violation_details,
        e.id as employee_id, e.name as employee_name, e.hourly_rate,
        a.name as location_name
      FROM shifts s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN assignments a ON s.assignment_id = a.id
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 1;

        if (month) {
            query += ` AND TO_CHAR(s.start_time, 'YYYY-MM') = $${paramCount++}`;
            values.push(month);
        }

        if (employeeId) {
            query += ` AND s.employee_id = $${paramCount++}`;
            values.push(employeeId);
        }

        query += ` ORDER BY s.start_time DESC`;

        const shifts = await sql(query, values);

        // Calculate totals
        const result = shifts.map(shift => {
            // Calculate Planned Duration
            const start = new Date(shift.start_time);
            const end = new Date(shift.end_time);
            const plannedMinutes = (end - start) / 60000 - (shift.break_minutes || 0);

            // Calculate Actual Duration
            let actualMinutes = 0;
            if (shift.actual_start_time && shift.actual_end_time) {
                const actStart = new Date(shift.actual_start_time);
                const actEnd = new Date(shift.actual_end_time);
                actualMinutes = (actEnd - actStart) / 60000 - (shift.actual_break_minutes || 0);
            }

            return {
                ...shift,
                planned_duration: Math.max(0, plannedMinutes / 60), // hours
                actual_duration: Math.max(0, actualMinutes / 60)   // hours
            };
        });

        return Response.json(result);
    } catch (error) {
        console.error("Error fetching hours:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const session = await getSession(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        console.log("PUT /api/hours body:", body);
        const { id, actual_start_time, actual_end_time, actual_break_minutes, status, admin_notes, clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng } = body;

        if (!id) return Response.json({ error: "ID required" }, { status: 400 });

        // Retrieve subscription status for feature flag check
        const users = await sql`SELECT subscription_status FROM auth_users WHERE id = ${session.user.id}`;
        const subStatus = users[0]?.subscription_status || 'trialing';

        let is_geofence_violation = false;
        let geofence_violation_details = null;

        if (hasFeatureAccess(subStatus, 'gps_tracking_geofencing')) {
            // Check assignment location to validate geofence
            const shiftInfo = await sql`
                SELECT s.assignment_id, a.latitude as a_lat, a.longitude as a_lng, a.geofence_radius_meters as a_radius 
                FROM shifts s LEFT JOIN assignments a ON s.assignment_id = a.id 
                WHERE s.id = ${id}
            `;
            const assignment = shiftInfo[0];

            if (assignment && assignment.a_lat && assignment.a_lng) {
                // If clocking in with location
                if (clock_in_lat && clock_in_lng) {
                    const distIn = getDistanceFromLatLonInM(clock_in_lat, clock_in_lng, assignment.a_lat, assignment.a_lng);
                    if (distIn > (assignment.a_radius || 100)) {
                        is_geofence_violation = true;
                        geofence_violation_details = `Inklok locatie was ${distIn}m verwijderd van toegestane zone.`;
                    }
                }
                // If clocking out with location
                if (clock_out_lat && clock_out_lng) {
                    const distOut = getDistanceFromLatLonInM(clock_out_lat, clock_out_lng, assignment.a_lat, assignment.a_lng);
                    if (distOut > (assignment.a_radius || 100)) {
                        is_geofence_violation = true;
                        geofence_violation_details = (geofence_violation_details ? geofence_violation_details + " " : "") +
                            `Uitklok locatie was ${distOut}m verwijderd.`;
                    }
                }
            }
        }

        const [updatedShift] = await sql`
      UPDATE shifts
      SET 
        actual_start_time = ${actual_start_time || null},
        actual_end_time = ${actual_end_time || null},
        actual_break_minutes = ${actual_break_minutes || 0},
        status = ${status || 'planned'},
        admin_notes = ${admin_notes || null},
        clock_in_lat = ${clock_in_lat || null},
        clock_in_lng = ${clock_in_lng || null},
        clock_out_lat = ${clock_out_lat || null},
        clock_out_lng = ${clock_out_lng || null},
        is_geofence_violation = ${is_geofence_violation},
        geofence_violation_details = ${geofence_violation_details || null}
      WHERE id = ${id}
      RETURNING *
    `;
        console.log("Updated shift:", updatedShift);
        return Response.json(updatedShift);
    } catch (error) {
        console.error("PUT /api/hours ERROR:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
