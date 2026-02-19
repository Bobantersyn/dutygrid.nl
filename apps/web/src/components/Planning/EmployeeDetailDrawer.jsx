
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Trash2,
    Calendar,
    User,
    Phone,
    Mail,
    MapPin,
    Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import { LeaveRegistrationModal } from "./LeaveRegistrationModal";

export function EmployeeDetailDrawer({ employeeId, weekStart, onClose, isPlannerOrAdmin }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("availability"); // 'availability' or 'info'
    const [showAddException, setShowAddException] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [newException, setNewException] = useState({
        date: "",
        reason: "",
        is_available: false,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["availability-detail", employeeId, weekStart],
        queryFn: async () => {
            const response = await fetch(
                `/api/availability/week-overview?employee_id=${employeeId}&week_start=${weekStart}&include_future_leave=true`,
            );
            if (!response.ok) throw new Error("Failed to fetch availability");
            return response.json();
        },
        enabled: !!employeeId && !!weekStart,
    });

    const deleteExceptionMutation = useMutation({
        mutationFn: async (date) => {
            // Find exception ID
            const exceptionsResponse = await fetch(
                `/api/availability/exceptions?employee_id=${employeeId}`,
            );
            const exceptionsData = await exceptionsResponse.json();
            const exception = exceptionsData.exceptions.find(
                (ex) => ex.exception_date.split("T")[0] === date,
            );

            if (!exception) throw new Error("Exception not found");

            const response = await fetch(
                `/api/availability/exceptions?id=${exception.id}`,
                { method: "DELETE" },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to delete exception");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([
                "availability-detail",
                employeeId,
                weekStart,
            ]);
            queryClient.invalidateQueries(["availability-week-overview", weekStart]);
            queryClient.invalidateQueries(["planning-availability"]); // Update main view counts
        },
    });

    const addExceptionMutation = useMutation({
        mutationFn: async (exception) => {
            const response = await fetch("/api/availability/exceptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: employeeId,
                    exception_date: exception.date,
                    is_available: exception.is_available,
                    reason: exception.reason,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to add exception");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([
                "availability-detail",
                employeeId,
                weekStart,
            ]);
            queryClient.invalidateQueries(["availability-week-overview", weekStart]);
            queryClient.invalidateQueries(["planning-availability"]);
            setNewException({ date: "", reason: "", is_available: false });
            setShowAddException(false);
        },
    });

    const handleAddException = () => {
        if (!newException.date) return;
        addExceptionMutation.mutate(newException);
    };

    // Helper to group consecutive dates
    const groupedFutureLeave = useMemo(() => {
        if (!data?.future_leave || data.future_leave.length === 0) return [];

        const groups = [];
        let currentGroup = null;

        data.future_leave.forEach((leave, index) => {
            const date = new Date(leave.date);

            if (!currentGroup) {
                currentGroup = {
                    startDate: leave.date,
                    endDate: leave.date,
                    reason: leave.reason,
                    dates: [leave.date]
                };
            } else {
                // Check if consecutive (difference of 1 day)
                const prevDate = new Date(currentGroup.endDate);
                const diffTime = Math.abs(date - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1 && leave.reason === currentGroup.reason) {
                    currentGroup.endDate = leave.date;
                    currentGroup.dates.push(leave.date);
                } else {
                    groups.push(currentGroup);
                    currentGroup = {
                        startDate: leave.date,
                        endDate: leave.date,
                        reason: leave.reason,
                        dates: [leave.date]
                    };
                }
            }

            // Push last group
            if (index === data.future_leave.length - 1) {
                groups.push(currentGroup);
            }
        });

        return groups;
    }, [data?.future_leave]);

    if (!employeeId) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100">

                {/* Header */}
                {/* Content Area */}
                {/* Effect to switch tab removed to allow access */}

                <div className="p-6 border-b border-gray-100 bg-white z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
                            ) : (
                                <h2 className="text-2xl font-bold text-gray-900">{data?.employee?.name}</h2>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Medewerker Details</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                        {/* Show Availability tab if employee manages it OR if user is planner (to manage leave) */}
                        {(isLoading || data?.employee?.can_manage_own_availability || isPlannerOrAdmin) && (
                            <button
                                onClick={() => setActiveTab("availability")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "availability"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                            >
                                <Calendar size={16} />
                                {data?.employee?.can_manage_own_availability ? "Beschikbaarheid" : "Afwezigheid & Verlof"}
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "info"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                        >
                            <User size={16} />
                            Info & Profiel
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            {activeTab === "availability" && (
                                <div className="space-y-4">
                                    {/* --- LOGIC SPLIT: Fixed vs Flex --- */}
                                    {!data?.employee?.can_manage_own_availability ? (
                                        // CASE A: Fixed Employee (Planner Determines)
                                        <div className="space-y-4">
                                            {/* 1. Explicit Statement */}
                                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-blue-900 text-sm">Beschikbaarheid wordt bepaald door de planner.</h4>
                                                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                                        Voor deze medewerker worden geen losse beschikbaarheidsdagen bijgehouden.
                                                        Afwezigheid en verlof worden hieronder als uitzondering getoond.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 2. List of EXCEPTIONS Only */}
                                            {/* Filter strictly for 'exception' source (or explicit unavailable override) */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Geregistreerde Afwezigheid</h5>

                                                {data?.week
                                                    .filter(day => day.source === 'exception' || (day.is_override && !day.available)) // Rule C/D: Show absence
                                                    .map(day => (
                                                        <div key={day.date} className="bg-white border-l-4 border-red-400 rounded-r-lg p-3 flex items-center justify-between shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-full bg-red-50 text-red-600">
                                                                    <XCircle size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                        <span>{day.day} {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}</span>
                                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                                                            {day.available ? 'Override' : 'Afwezig'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {day.reason || "Geen reden opgegeven"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {isPlannerOrAdmin && (
                                                                <button
                                                                    onClick={() => deleteExceptionMutation.mutate(day.date)}
                                                                    disabled={deleteExceptionMutation.isPending}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Verwijder uitzondering"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}

                                                {data?.week.filter(day => day.source === 'exception').length === 0 && (
                                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                                        <p className="text-sm text-gray-400">Geen afwezigheid of verlof geregistreerd deze week.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // CASE B: Flex Employee (Full List)
                                        // This is the original rendering logic
                                        data?.week.map((day) => {
                                            const isException = day.source === "exception";
                                            // Flex employees can contain overrides too!
                                            const canDelete = isException && isPlannerOrAdmin;

                                            let statusColor = "bg-gray-100 border-gray-200 text-gray-500";
                                            let Icon = AlertCircle;

                                            // Rule B.2: Default = Nooit groen (unless availability filled)
                                            // If source is 'not_set', it stays gray.

                                            if (day.source === "not_set") {
                                                statusColor = "bg-gray-50 border-gray-200 text-gray-400";
                                                Icon = AlertCircle;
                                            } else if (day.available) {
                                                statusColor = "bg-green-50 border-green-200 text-green-700";
                                                Icon = CheckCircle;
                                            } else {
                                                statusColor = "bg-red-50 border-red-200 text-red-700";
                                                Icon = XCircle;
                                            }

                                            return (
                                                <div key={day.date} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${statusColor} bg-opacity-20`}>
                                                            <Icon size={18} className={day.available ? "text-green-600" : (day.source === 'not_set' ? "text-gray-400" : "text-red-500")} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                {day.day}
                                                                <span className="text-gray-400 text-xs font-normal">
                                                                    {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                                                                </span>
                                                                {isException && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                                                                        Override
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                                {day.available ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock size={12} />
                                                                        {day.start_time && day.end_time ? `${day.start_time} - ${day.end_time}` : "Hele dag"}
                                                                    </span>
                                                                ) : (
                                                                    <span>{day.reason || (day.source === 'not_set' ? "Geen opgave" : "Niet beschikbaar")}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {canDelete && (
                                                        <button
                                                            onClick={() => deleteExceptionMutation.mutate(day.date)}
                                                            disabled={deleteExceptionMutation.isPending}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Verwijder uitzondering"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Add Exception Buton for Planner */}
                                    {isPlannerOrAdmin && (
                                        <div className="pt-4 border-t border-gray-200">
                                            {!showAddException && (
                                                <div className="space-y-3">
                                                    {/* Button 1: Add SINGLE Override */}
                                                    <button
                                                        onClick={() => setShowAddException(true)}
                                                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                                                    >
                                                        <Plus size={18} />
                                                        Uitzondering (enkele dag)
                                                    </button>

                                                    {/* Button 2: Add Future Leave (Date Range) */}
                                                    <button
                                                        onClick={() => setShowLeaveModal(true)}
                                                        className="w-full py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center justify-center gap-2 font-bold"
                                                    >
                                                        <Calendar size={18} />
                                                        Afwezigheid / Verlof Registreren (Periode)
                                                    </button>
                                                </div>
                                            )}

                                            {showAddException && (
                                                <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                                                        Nieuwe Override (Enkele Dag)
                                                        <button onClick={() => setShowAddException(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                                    </h4>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Datum</label>
                                                            <select
                                                                value={newException.date}
                                                                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                                                                className="w-full text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Kies datum...</option>
                                                                {data?.week.map((day) => (
                                                                    <option key={day.date} value={day.date}>
                                                                        {day.day} {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button
                                                                    onClick={() => setNewException({ ...newException, is_available: true })}
                                                                    className={`p-2 text-sm rounded-lg border text-center transition-all ${newException.is_available ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                                >
                                                                    Beschikbaar
                                                                </button>
                                                                <button
                                                                    onClick={() => setNewException({ ...newException, is_available: false })}
                                                                    className={`p-2 text-sm rounded-lg border text-center transition-all ${!newException.is_available ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                                >
                                                                    Niet Beschikbaar
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Reden</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Bijv. Ziek, Extra inzet..."
                                                                value={newException.reason}
                                                                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                                                                className="w-full text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>

                                                        {addExceptionMutation.isError && (
                                                            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 mb-2">
                                                                {addExceptionMutation.error?.message}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={handleAddException}
                                                            disabled={!newException.date || addExceptionMutation.isPending}
                                                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {addExceptionMutation.isPending ? 'Opslaan...' : 'Opslaan'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {groupedFutureLeave.length > 0 && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Calendar size={12} />
                                                Toekomstig Verlof
                                            </h5>
                                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 space-y-1">
                                                {groupedFutureLeave.slice(0, 5).map((group, idx) => (
                                                    <button
                                                        key={`${group.startDate}-${idx}`}
                                                        onClick={() => {
                                                            setSelectedLeave({
                                                                startDate: group.startDate,
                                                                endDate: group.endDate,
                                                                reason: group.reason
                                                            });
                                                            setShowLeaveModal(true);
                                                        }}
                                                        className="w-full flex items-center justify-between text-sm p-2 hover:bg-orange-100 rounded-md transition-colors text-left"
                                                        title="Klik om te bewerken of verwijderen"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-orange-900 font-medium">
                                                                {new Date(group.startDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                                                                {group.startDate !== group.endDate && (
                                                                    <> - {new Date(group.endDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-orange-600/70 capitalize">{group.reason}</span>
                                                        </div>
                                                        <div className="text-orange-400">
                                                            →
                                                        </div>
                                                    </button>
                                                ))}
                                                {groupedFutureLeave.length > 5 && (
                                                    <div className="text-xs text-center text-orange-600 font-medium pt-1">
                                                        + nog {groupedFutureLeave.length - 5} periodes
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "info" && (
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                                {data?.employee?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{data?.employee?.name}</h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <span className={`w-2 h-2 rounded-full ${data?.employee?.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    {data?.employee?.status === 'active' ? 'Actief' : 'Inactief'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="truncate">{data?.employee?.email || 'Geen e-mail'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Phone size={16} className="text-gray-400" />
                                                <span>{data?.employee?.phone || 'Geen telefoon'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span className="truncate">{data?.employee?.address || 'Geen adres'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract Info (Simulated if not in API yet) */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock size={16} className="text-blue-600" />
                                            Contract & Uren
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 mb-1">Max per week</div>
                                                <div className="font-bold text-lg">{data?.employee?.max_hours_per_week || 40}u</div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 mb-1">Max per dag</div>
                                                <div className="font-bold text-lg">{data?.employee?.max_hours_per_day || 8}u</div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                                                <div className="text-xs text-gray-500 mb-1">CAO Type</div>
                                                <div className="font-bold">{data?.employee?.cao_type || 'Standaard Beveiliging'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                                        ℹ️ Dit profiel is <strong>alleen-lezen</strong>. Voor wijzigingen, ga naar de hoofdpagina Medewerkers.
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Leave Modal */}
            <LeaveRegistrationModal
                isOpen={showLeaveModal}
                onClose={() => {
                    setShowLeaveModal(false);
                    setSelectedLeave(null);
                }}
                employee={data?.employee}
                initialData={selectedLeave}
                onSuccess={() => {
                    // Refresh data
                    queryClient.invalidateQueries(["availability-detail", employeeId, weekStart]);
                    queryClient.invalidateQueries(["availability-week-overview", weekStart]);
                }}
            />
        </div>
    );
}
