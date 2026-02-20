import { X } from "lucide-react";
import { AvailabilityOverview } from "@/components/Dashboard/AvailabilityOverview";

export function AvailabilityStatusModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-900">Beschikbaarheid Overzicht</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Reuse the existing widget, but we might want to adjust its styling context later if needed. 
               For now, it fits well as a content block. */}
                    <AvailabilityOverview />
                </div>
            </div>
        </div>
    );
}
