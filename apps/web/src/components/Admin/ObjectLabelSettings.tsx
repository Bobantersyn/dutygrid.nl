"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag } from "lucide-react";

export function ObjectLabelSettings() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [error, setError] = useState(null);

    const { data: labelsData, isLoading } = useQuery({
        queryKey: ["object-labels"],
        queryFn: async () => {
            const res = await fetch("/api/object-labels");
            if (!res.ok) throw new Error("Failed to fetch labels");
            return res.json();
        }
    });

    const labels = labelsData?.labels || [];

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch("/api/object-labels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Aanmaken mislukt");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["object-labels"]);
            setIsAdding(false);
            setFormData({ name: "", description: "" });
            setError(null);
        },
        onError: (err) => setError(err.message)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Object Labels</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nieuw Label
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Nieuw Object Label Aanmaken</h3>
                    {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1">Naam</label>
                            <input
                                type="text" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="bijv. Hondenbegeleider, VCA-VOL, EHBO"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Beschrijving (optioneel)</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button disabled={createMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                {createMutation.isPending ? "Aanmaken..." : "Opslaan"}
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                Annuleren
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Label Naam</th>
                            <th className="px-6 py-4 font-semibold">Beschrijving</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {labels.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                                    Geen labels gevonden.
                                </td>
                            </tr>
                        ) : (
                            labels.map(label => (
                                <tr key={label.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-blue-500" />
                                            {label.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{label.description || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
