import { RefreshCw, ChevronUp, ChevronDown, Users } from "lucide-react";

export function SwapRequestsPanel({
  pendingSwaps,
  isExpanded,
  onToggle,
  onReviewSwap,
}) {
  if (pendingSwaps.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-blue-600 flex-shrink-0" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-blue-900">
                {pendingSwaps.length} Openstaande Swap Aanvra
                {pendingSwaps.length === 1 ? "ag" : "gen"}
              </h3>
              <p className="text-sm text-blue-700">
                Klik om details te bekijken en goed te keuren
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-blue-600" size={24} />
          ) : (
            <ChevronDown className="text-blue-600" size={24} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            {pendingSwaps.slice(0, 5).map((swap) => (
              <div
                key={swap.id}
                className="p-4 bg-white border border-blue-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {swap.requesting_employee_name}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {swap.swap_type === "takeover" ? "Overname" : "Ruil"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Dienst:</strong>{" "}
                      {new Date(swap.shift_date).toLocaleDateString("nl-NL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {swap.start_time.slice(0, 5)} -{" "}
                      {swap.end_time.slice(0, 5)}
                    </p>
                    {swap.location_name && (
                      <p className="text-sm text-orange-700">
                        📍 {swap.location_name}
                      </p>
                    )}
                    {swap.target_employee_name ? (
                      <p className="text-sm text-green-700 mt-1">
                        ✅ Overgenomen door: {swap.target_employee_name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        🔓 Open voor iedereen
                      </p>
                    )}
                    {swap.reason && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        💬 {swap.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onReviewSwap(swap)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Beoordelen
                  </button>
                </div>
              </div>
            ))}
            {pendingSwaps.length > 5 && (
              <p className="text-sm text-blue-700 font-semibold text-center">
                + {pendingSwaps.length - 5} meer...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
