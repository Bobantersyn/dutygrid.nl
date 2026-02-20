import { X } from "lucide-react";
import { useState } from "react";

export function OverrideApprovalModal({ shift, onClose, onApprove }) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/shifts/${shift.id}/approve-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve override");
      }

      onApprove?.();
      onClose();
    } catch (error) {
      console.error("Error approving override:", error);
      alert(`Fout bij goedkeuren: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Shift Goedkeuren Buiten Beschikbaarheid
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Medewerker:</span>{" "}
              {shift.employee_name}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Datum:</span> {shift.shift_date}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Tijd:</span>{" "}
              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notitie (optioneel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bijv: 'Medewerker heeft mondeling toegezegd beschikbaar te zijn'"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Deze notitie is zichtbaar bij het groene vinkje
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Goedkeuren..." : "Goedkeuren"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
