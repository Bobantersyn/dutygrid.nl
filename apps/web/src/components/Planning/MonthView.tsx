import { useState } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";

const dayNamesShort = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export function MonthView({
    currentDate,
    shifts,
    isPlannerOrAdmin,
    onDaySelect,
    selectedDate,
}) {
    const [activeMonth, setActiveMonth] = useState(new Date(currentDate));

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const generateCalendarDays = () => {
        const year = activeMonth.getFullYear();
        const month = activeMonth.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayShifts = shifts.filter(s => s.shift_date === dateStr);

            // Find if user has a personal shift today (blue dot)
            // Or if planner/admin, just show a dot to indicate there are shifts
            const hasShifts = dayShifts.length > 0;
            const hasOpenShifts = dayShifts.some(s => !s.employee_name);

            days.push({
                date: dateStr,
                day: i,
                hasShifts,
                hasOpenShifts,
                isToday: dateStr === new Date().toISOString().split('T')[0]
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1));
    };

    const days = generateCalendarDays();
    const selectedDayShifts = selectedDate ? shifts.filter(s => s.shift_date === selectedDate) : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Calendar Block */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Month Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 capitalize">
                        {activeMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 mb-2">
                        {dayNamesShort.map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                        {days.map((dayObj, idx) => {
                            if (!dayObj) return <div key={`empty-${idx}`} />;

                            const isSelected = selectedDate === dayObj.date;

                            return (
                                <button
                                    key={dayObj.date}
                                    onClick={() => onDaySelect(dayObj.date)}
                                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all h-12 w-full
                    ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}
                  `}
                                >
                                    <span className={`text-sm font-medium ${dayObj.isToday && !isSelected ? 'text-blue-600 font-bold' : ''}`}>
                                        {dayObj.day}
                                    </span>

                                    {/* Dot Indicators */}
                                    <div className="absolute bottom-1 flex gap-1">
                                        {dayObj.hasShifts && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                                        )}
                                        {dayObj.hasOpenShifts && isPlannerOrAdmin && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-red-200' : 'bg-red-500'}`}></span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Day Overview (Only shows if a day is clicked) */}
            {selectedDate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Diensten op {new Date(selectedDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>

                    {selectedDayShifts.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDayShifts.map((shift) => (
                                <div key={shift.id} className="p-4 border border-gray-100 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-900">{shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}</div>
                                        <div className="text-sm text-gray-500">{shift.role_name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-medium ${shift.employee_name ? 'text-gray-900' : 'text-red-500'}`}>
                                            {shift.employee_name || "Open Dienst"}
                                        </div>
                                        <div className="text-xs text-gray-500">{shift.client_name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                            Geen diensten gepland op deze datum.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
