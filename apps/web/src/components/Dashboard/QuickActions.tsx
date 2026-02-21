import { Plus, RefreshCw, Calendar, Users, Building2, MapPin } from "lucide-react";

export function QuickActions({ isPlannerOrAdmin }) {
  const ActionCard = ({ href, icon: Icon, title, description, highlightColor = "blue" }: {
    href: string,
    icon: any,
    title: string,
    description: string,
    highlightColor?: string
  }) => (
    <a
      href={href}
      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group bg-white shadow-sm"
    >
      <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon className="text-blue-600" size={24} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </a>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Snelle Acties</h2>
        <div className="h-px bg-gray-100 flex-1 ml-4"></div>
      </div>

      <div
        className={`grid grid-cols-1 ${isPlannerOrAdmin ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2"} gap-4`}
      >
        {isPlannerOrAdmin ? (
          <>
            <ActionCard
              href="/clients"
              icon={Building2}
              title="Nieuwe Klant"
              description="Voeg klant toe"
            />
            <ActionCard
              href="/clients"
              icon={MapPin}
              title="Nieuwe Opdracht"
              description="Voeg locatie toe"
            />
            <ActionCard
              href="/employees/new"
              icon={Users}
              title="Nieuwe Medewerker"
              description="Voeg medewerker toe"
            />
            <ActionCard
              href="/planning/new"
              icon={Calendar}
              title="Nieuwe Dienst"
              description="Plan dienst in"
            />
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:col-span-2">
            <ActionCard
              href="/diensten-ruilen"
              icon={RefreshCw}
              title="Diensten Ruilen"
              description="Bied aan of neem over"
            />
            {/* Add more employee quick actions if needed */}
          </div>
        )}
      </div>
    </div>
  );
}
