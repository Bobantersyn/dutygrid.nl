import { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Save, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function LeaveRegistrationModal({ isOpen, onClose, employee, onSuccess, initialData }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: 'Vakantie',
        notes: '',
    });
    const [error, setError] = useState(null);

    // Initialize form with data if provided (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                startDate: initialData.startDate,
                endDate: initialData.endDate,
                reason: initialData.reason || 'Vakantie',
                notes: '',
            });
        } else {
            setFormData({
                startDate: '',
                endDate: '',
                reason: 'Vakantie',
                notes: '',
            });
        }
    }, [initialData, isOpen]);

    // Mutation to save batch exceptions
    const saveBatchMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/availability/exceptions/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employee.id,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    reason: data.reason, // Combined reason/type
                    is_available: false, // Always false for Leave/Absence
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save leave');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['availability']);
            queryClient.invalidateQueries(['week-overview']);
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setFormData({
                startDate: '',
                endDate: '',
                reason: 'Vakantie',
                notes: '',
            });
            setError(null);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    // Mutation to DELETE batch exceptions
    const deleteBatchMutation = useMutation({
        mutationFn: async () => {
            // Use initialData dates for deletion (what was originally selected)
            // Or current form dates? Usually delete original range.
            // Let's use form dates as they are prefilled, but if user changed dates it's tricky.
            // Simplified: Delete based on current form inputs (assuming they represent the range to remove/mod)

            const response = await fetch('/api/availability/exceptions/batch/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employee.id,
                    start_date: initialData ? initialData.startDate : formData.startDate,
                    end_date: initialData ? initialData.endDate : formData.endDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete leave');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['availability']);
            queryClient.invalidateQueries(['week-overview']);
            if (onSuccess) onSuccess();
            onClose();
            setError(null);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    if (!isOpen || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            setError("Start- en einddatum zijn verplicht.");
            return;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError("Einddatum mag niet voor startdatum liggen.");
            return;
        }
        setError(null);
        saveBatchMutation.mutate(formData);
    };

    const handleDelete = () => {
        if (confirm("Weet je zeker dat je dit verlof wilt verwijderen?")) {
            deleteBatchMutation.mutate();
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{initialData ? 'Verlof Bewerken' : 'Verlof Registreren'}</h3>
                        <p className="text-sm text-gray-500">Voor {employee.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Startdatum</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Einddatum</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Reden / Type</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        >
                            <option value="Vakantie">Vakantie</option>
                            <option value="Ziek">Ziek</option>
                            <option value="Verlof">Overig Verlof</option>
                            <option value="Opleiding">Opleiding</option>
                            <option value="Prive">Privé omstandigheden</option>
                        </select>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg">
                        <strong>Let op:</strong> Dit markeert de medewerker als <u>Niet Beschikbaar</u> voor de hele periode. Bestaande diensten in deze periode blijven staan maar krijgen een waarschuwing (Override).
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    {initialData ? (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteBatchMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Verwijderen
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saveBatchMutation.isPending || deleteBatchMutation.isPending}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveBatchMutation.isPending ? (
                                'Opslaan...'
                            ) : (
                                <>
                                    <Save size={16} />
                                    {initialData ? 'Wijzigen Opslaan' : 'Verlof Opslaan'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
