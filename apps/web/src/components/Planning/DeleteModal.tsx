export function DeleteModal({ onCancel, onConfirm, isPending }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Dienst Verwijderen
        </h3>
        <p className="text-gray-600 mb-6">
          Weet je zeker dat je deze dienst wilt verwijderen?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Bezig..." : "Verwijderen"}
          </button>
        </div>
      </div>
    </div>
  );
}
