import sql from "./sql.js";
import {
  calculateDistance,
  calculateTravelCosts,
} from "./distance.js";

/**
 * Check if a new shift violates the 12-hour rest rule
 * @param {number} employeeId - The employee ID
 * @param {string} shiftDate - The shift date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} excludeShiftId - Optional shift ID to exclude from check (for updates)
 * @returns {Promise<{valid: boolean, violation: object|null}>}
 */
export async function checkRestTimeViolation(
  employeeId,
  shiftDate,
  startTime,
  endTime,
  excludeShiftId = null,
) {
  // Convert shift times to datetime for comparison
  const shiftStart = new Date(`${shiftDate}T${startTime}`);
  const shiftEnd = new Date(`${shiftDate}T${endTime}`);

  // If shift ends after midnight, adjust the end date
  if (shiftEnd < shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  // Get all shifts for this employee around this date
  const dayBefore = new Date(shiftDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter = new Date(shiftDate);
  dayAfter.setDate(dayAfter.getDate() + 1);

  let shifts;
  if (excludeShiftId) {
    shifts = await sql`
      SELECT id, start_time::date as shift_date, start_time, end_time
      FROM shifts
      WHERE employee_id = ${employeeId}
        AND start_time::date >= ${dayBefore.toISOString().split("T")[0]}
        AND start_time::date <= ${dayAfter.toISOString().split("T")[0]}
        AND id != ${excludeShiftId}
      ORDER BY start_time
    `;
  } else {
    shifts = await sql`
      SELECT id, start_time::date as shift_date, start_time, end_time
      FROM shifts
      WHERE employee_id = ${employeeId}
        AND start_time::date >= ${dayBefore.toISOString().split("T")[0]}
        AND start_time::date <= ${dayAfter.toISOString().split("T")[0]}
      ORDER BY start_time
    `;
  }

  // Check each existing shift for rest time violations
  for (const existingShift of shifts) {
    const existingStart = new Date(existingShift.start_time);
    let existingEnd = new Date(existingShift.end_time);

    // If existing shift ends after midnight
    if (existingEnd < existingStart) {
      existingEnd.setDate(existingEnd.getDate() + 1);
    }

    // Calculate rest time in hours
    const restBetween = Math.min(
      Math.abs(shiftStart - existingEnd),
      Math.abs(existingStart - shiftEnd),
    );
    const restHours = restBetween / (1000 * 60 * 60);

    // If rest time is less than 12 hours, it's a violation
    if (restHours < 12) {
      return {
        valid: false,
        violation: {
          conflictingShiftId: existingShift.id,
          conflictingDate: existingShift.shift_date,
          conflictingStart: existingShift.start_time,
          conflictingEnd: existingShift.end_time,
          restHours: restHours.toFixed(1),
          message: `Rusttijd van ${restHours.toFixed(1)} uur is minder dan de verplichte 12 uur`,
        },
      };
    }
  }

  return { valid: true, violation: null };
}

/**
 * Detect gaps in planning for active assignments
 * Suggests available employees to fill gaps
 * @param {string} startDate - Start date to check (YYYY-MM-DD)
 * @param {string} endDate - End date to check (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of gaps with suggested employees
 */
export async function detectPlanningGaps(startDate, endDate) {
  // Get all active assignments
  const assignments = await sql`
    SELECT a.id, a.name as location_name, a.address as location_address, a.client_id, c.name as client_name
    FROM assignments a
    LEFT JOIN clients c ON a.client_id = c.id
    WHERE a.status = 'active'
  `;

  if (assignments.length === 0) {
    return [];
  }

  const gaps = [];

  // For each assignment, check if there are shifts planned for each day
  for (const assignment of assignments) {
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Check if there are any shifts for this assignment on this date
      const shifts = await sql`
        SELECT id
        FROM shifts
        WHERE assignment_id = ${assignment.id}
          AND start_time::date = ${dateStr}
        LIMIT 1
      `;

      if (shifts.length === 0) {
        // This is a gap! Find available employees
        const availableEmployees = await findAvailableEmployees(
          dateStr,
          assignment.location_address,
        );

        gaps.push({
          assignment_id: assignment.id,
          location_name: assignment.location_name,
          location_address: assignment.location_address,
          client_name: assignment.client_name,
          date: dateStr,
          suggested_employees: availableEmployees,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return gaps;
}

/**
 * Find employees available on a specific date with smart scoring
 * @param {string} date - Date to check (YYYY-MM-DD)
 * @param {string} assignmentAddress - Assignment location address
 * @returns {Promise<Array>} Array of available employees with scores
 */
async function findAvailableEmployees(date, assignmentAddress) {
  // Get all active employees
  const allEmployees = await sql`
    SELECT id, name, cao_type, max_hours_per_day, max_hours_per_week, address as home_address, status, badge_type, is_flexible
    FROM employees
    WHERE status = 'active'
  `;

  const available = [];

  for (const employee of allEmployees) {
    let score = 100; // Start with perfect score
    let reasons = [];
    let warnings = [];

    // Check if employee already has a shift on this date
    const existingShifts = await sql`
      SELECT id, start_time, end_time
      FROM shifts
      WHERE employee_id = ${employee.id}
        AND start_time::date = ${date}
    `;

    if (existingShifts.length > 0) {
      // Already has shift on this day - skip or heavily penalize
      continue;
    }

    // Check previous day for 12-hour rest rule
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayStr = prevDay.toISOString().split("T")[0];

    const prevShifts = await sql`
      SELECT start_time::date as shift_date, start_time, end_time
      FROM shifts
      WHERE employee_id = ${employee.id}
        AND start_time::date = ${prevDayStr}
    `;

    if (prevShifts.length > 0) {
      const prevShift = prevShifts[0];
      const prevEnd = new Date(prevShift.end_time);

      // If previous shift ended after midnight, adjust date
      if (prevShift.end_time < prevShift.start_time) {
        prevEnd.setDate(prevEnd.getDate() + 1);
      }

      const assumedStart = new Date(`${date}T08:00:00`); // Assume 8 AM start
      const restHours = (assumedStart - prevEnd) / (1000 * 60 * 60);

      if (restHours < 12) {
        score -= 50;
        warnings.push(`Slechts ${restHours.toFixed(1)}u rust na vorige dienst`);

        // Extra warning if night shift followed by day shift
        /*
        if (prevShift.shift_type === "nacht") {
          score -= 30;
          warnings.push("⚠️ NACHTDIENST → DAGDIENST");
        }
        */
      } else {
        reasons.push(`${restHours.toFixed(0)}u rust na vorige dienst`);
      }
    } else {
      reasons.push("Geen vorige dienst");
      score += 10;
    }

    // Check next day for planning conflicts
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];

    const nextShifts = await sql`
      SELECT start_time::date as shift_date, start_time
      FROM shifts
      WHERE employee_id = ${employee.id}
        AND start_time::date = ${nextDayStr}
    `;

    if (nextShifts.length > 0) {
      const nextShift = nextShifts[0];
      const assumedEnd = new Date(`${date}T20:00:00`); // Assume 8 PM end
      const nextStart = new Date(nextShift.start_time);
      const restHours = (nextStart - assumedEnd) / (1000 * 60 * 60);

      if (restHours < 12) {
        score -= 30;
        warnings.push(`Volgende dienst over ${restHours.toFixed(1)}u`);
      }
    }

    // Calculate distance and travel costs
    let distanceKm = null;
    let travelCosts = null;

    if (employee.home_address && assignmentAddress) {
      distanceKm = await calculateDistance(
        employee.home_address,
        assignmentAddress,
      );
      if (distanceKm !== null) {
        travelCosts = calculateTravelCosts(distanceKm);

        // Score based on distance
        if (distanceKm < 10) {
          score += 15;
          reasons.push(`${distanceKm.toFixed(1)} km (dichtbij)`);
        } else if (distanceKm < 30) {
          score += 5;
          reasons.push(`${distanceKm.toFixed(1)} km`);
        } else if (distanceKm > 50) {
          score -= 10;
          reasons.push(`${distanceKm.toFixed(1)} km (ver)`);
        } else {
          reasons.push(`${distanceKm.toFixed(1)} km`);
        }
      }
    }

    // Check badge type (green badge gets priority)
    if (employee.badge_type === "groen") {
      score += 10;
      reasons.push("Groene pas");
    } else if (employee.badge_type === "grijs") {
      score += 5;
      reasons.push("Grijze pas");
    }

    // Small priority for flexible employees for short-notice gaps
    if (employee.is_flexible) {
      score += 5;
      reasons.push("Flex-pool");
    }

    // Check weekly hours
    const weeklyCheck = await checkWeeklyHours(
      employee.id,
      date,
      employee.max_hours_per_week,
      8, // Assume 8 hour shift
    );

    if (!weeklyCheck.valid) {
      score -= 40;
      warnings.push(
        `${weeklyCheck.currentHours.toFixed(0)}/${employee.max_hours_per_week}u deze week`,
      );
    } else {
      const hoursLeft = employee.max_hours_per_week - weeklyCheck.currentHours;
      if (hoursLeft < 16) {
        score -= 10;
      }
      reasons.push(
        `${weeklyCheck.currentHours.toFixed(0)}/${employee.max_hours_per_week}u deze week`,
      );
    }

    const displayName = employee.name;

    available.push({
      id: employee.id,
      name: displayName,
      cao_type: employee.cao_type,
      score,
      reasons,
      warnings,
      distance_km: distanceKm,
      travel_costs: travelCosts,
    });
  }

  // Sort by score (highest first)
  available.sort((a, b) => b.score - a.score);

  return available;
}

/**
 * Check if employee has worked too many hours in a week
 * @param {number} employeeId - The employee ID
 * @param {string} date - Date in the week to check (YYYY-MM-DD)
 * @param {number} maxHoursPerWeek - Max hours allowed per week
 * @param {number} additionalHours - Additional hours to add (for new shift)
 * @returns {Promise<{valid: boolean, currentHours: number, maxHours: number}>}
 */
export async function checkWeeklyHours(
  employeeId,
  date,
  maxHoursPerWeek,
  additionalHours = 0,
) {
  // Get start of week (Monday)
  const checkDate = new Date(date);
  const dayOfWeek = checkDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
  const monday = new Date(checkDate);
  monday.setDate(checkDate.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  // Get all shifts this week
  const shifts = await sql`
    SELECT start_time, end_time, break_minutes
    FROM shifts
    WHERE employee_id = ${employeeId}
      AND start_time::date >= ${mondayStr}
      AND start_time::date <= ${sundayStr}
  `;

  let totalHours = 0;
  for (const shift of shifts) {
    const start = new Date(shift.start_time);
    let end = new Date(shift.end_time);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const hours = (end - start) / (1000 * 60 * 60);
    const breakHours = (shift.break_minutes || 0) / 60;
    totalHours += hours - breakHours;
  }

  totalHours += additionalHours;

  return {
    valid: totalHours <= maxHoursPerWeek,
    currentHours: totalHours,
    maxHours: maxHoursPerWeek,
  };
}
