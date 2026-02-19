"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, X, Clock, AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/Dashboard/LoadingState";

export default function MyLeavePage() {
    const { userLoading, roleLoading, employeeId } = useUserRole();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        type: "vakantie",
        note: "",
    });
    const [error, setError] = useState("");

    const { data: requests = [], isLoading: requestsLoading } = useQuery({
        queryKey: ["my-leave", employeeId],
        queryFn: async () => {
            const res = await fetch(`/api/leave?employee_id=${employeeId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            return data.requests || [];
        },
        enabled: !!employeeId,
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch("/api/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create request");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["my-leave"]);
            setIsModalOpen(false);
            setFormData({ start_date: "", end_date: "", type: "vakantie", note: "" });
            setError("");
        },
        onError: () => {
            setError("Er ging iets mis bij het aanvragen.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date) {
            setError("Vul alle datums in.");
            return;
        }
        if (formData.end_date < formData.start_date) {
            setError("Einddatum moet na startdatum liggen.");
            return;
        }
        createMutation.mutate({ ...formData, employee_id: employeeId });
    };

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        withdrawn: "bg-gray-100 text-gray-800",
    };

    const statusIcons = {
        pending: <Clock size={16} />,
        approved: <Check size={16} />,
        rejected: <X size={16} />,
        withdrawn: <AlertCircle size={16} />,
    };

    const typeLabels = {
        vakantie: "Vakantie 🏖️",
        verlof: "Verlof 🏠",
        ziek: "Ziek 🤒",
        overig: "Overig 📝",
    };

    if (userLoading || roleLoading || requestsLoading) return <LoadingState />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mijn Verlof</h1>
                        <p className="text-gray-600 mt-1">
                            Beheer je afwezigheid en zie de status van je aanvragen.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        Nieuwe Aanvraag
                    </button>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Je hebt nog geen verlofaanvragen.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Periode</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Opmerking</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actie</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {new Date(req.start_date).toLocaleDateString("nl-NL")} -{" "}
                                                {new Date(req.end_date).toLocaleDateString("nl-NL")}
                                            </td>
                                            <td className="px-6 py-4">
                                                {typeLabels[req.type] || req.type}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate" title={req.note}>
                                                {req.note || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${statusColors[req.status] || "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {statusIcons[req.status]}
                                                    {req.status === 'pending' ? 'Aangevraagd' :
                                                        req.status === 'approved' ? 'Goedgekeurd' :
                                                            req.status === 'rejected' ? 'Afgewezen' : req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === "pending" && (
                                                    // Withdraw logic not implemented in frontend yet, future enhancement
                                                    <span className="text-xs text-gray-400">Intrekken</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                Verlof Aanvragen
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Startdatum
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, start_date: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Einddatum
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, end_date: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, type: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="vakantie">Vakantie 🏖️</option>
                                    <option value="verlof">Verlof (Onbetaald/Overig) 🏠</option>
                                    <option value="ziek">Ziekte (Vooraf melden) 🤒</option>
                                    <option value="overig">Anders 📝</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Opmerking (Optioneel)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.note}
                                    onChange={(e) =>
                                        setFormData({ ...formData, note: e.target.value })
                                    }
                                    placeholder="Reden of toelichting..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                                // 'disabled' attribute was missing closing quote? No, it's JSX.
                                >
                                    {createMutation.isPending ? "Aanvragen..." : "Verstuur Aanvraag"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
