import { Users, Clock, MapPin, XCircle, CheckCircle } from "lucide-react";

export function SwapApprovalModal({
  swap,
  responseMessage,
  onResponseMessageChange,
  onApprove,
  onReject,
  onClose,
  isPending,
  error,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Swap Aanvraag Beoordelen
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-gray-600" />
            <span className="font-bold text-gray-900 text-lg">
              {swap.requesting_employee_name}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              {swap.swap_type === "takeover" ? "Overname" : "Ruil"}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Dienst:</strong>{" "}
              {new Date(swap.shift_date).toLocaleDateString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock size={14} />
              <span>
                <strong>Tijd:</strong> {swap.start_time.slice(0, 5)} -{" "}
                {swap.end_time.slice(0, 5)}
              </span>
            </div>
            {swap.location_name && (
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <MapPin size={14} />
                <span>
                  <strong>Locatie:</strong> {swap.location_name}
                </span>
              </div>
            )}
            {swap.target_employee_name && (
              <p className="text-sm text-green-700">
                <strong>Overgenomen door:</strong> {swap.target_employee_name}
              </p>
            )}
            {swap.reason && (
              <p className="text-sm text-gray-600 italic bg-white p-2 rounded border border-gray-200">
                💬 <strong>Reden:</strong> {swap.reason}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reactie (optioneel)
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => onResponseMessageChange(e.target.value)}
            placeholder="Optionele boodschap voor de medewerker..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            <XCircle size={20} />
            {isPending ? "Bezig..." : "Afwijzen"}
          </button>
          <button
            onClick={onApprove}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {isPending ? "Bezig..." : "Goedkeuren"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
