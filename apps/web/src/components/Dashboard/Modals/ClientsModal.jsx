import { X, Building2, Mail, Phone } from "lucide-react";

export function ClientsModal({ clients, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Building2 className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Klanten Overzicht
              </h3>
              <p className="text-sm text-gray-600">{clients.length} totaal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {clients.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Geen klanten gevonden
            </p>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">
                    {client.name}
                  </h4>
                  {client.contact_person && (
                    <p className="text-sm text-gray-600 mb-1">
                      👤 {client.contact_person}
                    </p>
                  )}
                  {client.email && (
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Mail size={14} /> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} /> {client.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <a
              href="/clients"
              className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
            >
              Bekijk Alle Klanten →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
