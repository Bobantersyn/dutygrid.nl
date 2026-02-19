import { X, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function LeaveRequestsModal({ requests = [], onClose }) {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await fetch(`/api/leave/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["leave-requests"]);
            queryClient.invalidateQueries(["dashboard-stats"]); // If we add a count there
        },
    });

    const handleAction = (id, status) => {
        if (confirm(`Weet je zeker dat je deze aanvraag wilt ${status === 'approved' ? 'goedkeuren' : 'afwijzen'}?`)) {
            updateMutation.mutate({ id, status });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50">
                    <h3 className="text-lg font-bold text-gray-900">
                        Openstaande Verlofaanvragen
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-0 overflow-y-auto flex-1">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Geen openstaande aanvragen.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-900 uppercase tracking-wider sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Medewerker</th>
                                    <th className="px-6 py-4">Periode</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Opmerking</th>
                                    <th className="px-6 py-4 text-right">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {req.employee_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(req.start_date).toLocaleDateString("nl-NL")} -{" "}
                                            {new Date(req.end_date).toLocaleDateString("nl-NL")}
                                        </td>
                                        <td className="px-6 py-4 uppercase text-xs font-bold tracking-wide">
                                            {req.type}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={req.note}>
                                            {req.note || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, "approved")}
                                                    disabled={updateMutation.isPending}
                                                    className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                                    title="Goedkeuren"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "rejected")}
                                                    disabled={updateMutation.isPending}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                                    title="Afwijzen"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                    <span className="text-xs text-gray-500">
                        Goedgekeurd verlof blokkeert de planning.
                    </span>
                </div>
            </div>
        </div>
    );
}
