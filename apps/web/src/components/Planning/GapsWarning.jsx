import { AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";

export function GapsWarning({ gaps, isExpanded, onToggle }) {
  if (gaps.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="w-full p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="text-orange-600 flex-shrink-0"
              size={24}
            />
            <div className="text-left">
              <h3 className="font-bold text-orange-900">
                {gaps.length} Openstaande Dienst
                {gaps.length > 1 ? "en" : ""}
              </h3>
              <p className="text-sm text-orange-700">
                Klik om details te bekijken
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-orange-600" size={24} />
          ) : (
            <ChevronDown className="text-orange-600" size={24} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="space-y-2">
            {gaps.slice(0, 5).map((gap, idx) => (
              <div key={idx} className="text-sm text-orange-800">
                <span className="font-semibold">{gap.location_name || "Onbekende locatie"}</span>
                {gap.client_name && ` (${gap.client_name})`} op{" "}
                {new Date(gap.shift_date || gap.date).toLocaleDateString("nl-NL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" "}
                {gap.start_time && `- ${gap.start_time.slice(0, 5)}`}
                {gap.suggested_employees && gap.suggested_employees.length > 0 && (
                  <span className="text-orange-700">
                    {" "}
                    - {gap.suggested_employees.length} beschikbaar
                  </span>
                )}
              </div>
            ))}
            {gaps.length > 5 && (
              <p className="text-sm text-orange-700 font-semibold">
                + {gaps.length - 5} meer...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
