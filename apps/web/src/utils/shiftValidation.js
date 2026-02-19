export function hasNightToDayWarning(shift, shifts) {
  const shiftDate = new Date(shift.shift_date);
  const prevDay = new Date(shiftDate);
  prevDay.setDate(prevDay.getDate() - 1);

  const prevShift = shifts.find((s) => {
    if (s.employee_id !== shift.employee_id) return false;
    const sDate = new Date(s.shift_date);
    return sDate.toDateString() === prevDay.toDateString();
  });

  if (
    prevShift &&
    prevShift.shift_type === "nacht" &&
    shift.shift_type === "dag"
  ) {
    return true;
  }

  return false;
}

export function hasRestTimeWarning(shift, shifts) {
  const shiftDate = new Date(shift.shift_date);
  const prevDay = new Date(shiftDate);
  prevDay.setDate(prevDay.getDate() - 1);

  const prevShift = shifts.find((s) => {
    if (s.employee_id !== shift.employee_id) return false;
    const sDate = new Date(s.shift_date);
    return sDate.toDateString() === prevDay.toDateString();
  });

  if (prevShift) {
    const prevEnd = new Date(`${prevShift.shift_date}T${prevShift.end_time}`);
    const currentStart = new Date(`${shift.shift_date}T${shift.start_time}`);
    const restHours = (currentStart - prevEnd) / (1000 * 60 * 60);
    if (restHours < 12) return true;
  }

  return false;
}

export function getShiftTypeIcon(shiftType) {
  switch (shiftType) {
    case "nacht":
      return "🌙";
    case "evenement":
      return "🎉";
    case "object":
      return "🏢";
    default:
      return "🌞";
  }
}
