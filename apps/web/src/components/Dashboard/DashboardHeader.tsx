import { Calendar, Users, Building2, MapPin, Clock, ArrowLeftRight, FileText, CalendarOff } from "lucide-react";
import NotificationBell from "../NotificationBell";


export function DashboardHeader({ isPlannerOrAdmin }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Beveiligingsplanning
            </h1>
            <p className="text-gray-600 mt-1">
              {isPlannerOrAdmin
                ? "Beheer je personeel, klanten en roosters"
                : "Mijn Planning"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isPlannerOrAdmin && (
              <>
                <a
                  href="/clients"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Building2 size={20} />
                  Klanten
                </a>
                <a
                  href="/assignments"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <MapPin size={20} />
                  Opdrachten
                </a>
                <a
                  href="/employees"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Users size={20} />
                  Medewerkers
                </a>
                <a
                  href="/facturatie/uren"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <FileText size={20} />
                  Facturatie
                </a>
              </>
            )}
            <a
              href="/planning"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Calendar size={20} />
              Planning
            </a>

            {isPlannerOrAdmin && (
              <a
                href="/planning/reports"
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <FileText size={20} />
                Rapportage
              </a>
            )}

            {!isPlannerOrAdmin && (
              <>
                <a
                  href="/beschikbaarheid"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Clock size={20} />
                  Beschikbaarheid
                </a>

                <a
                  href="/diensten-ruilen"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <ArrowLeftRight size={20} />
                  Ruilen
                </a>

                <a
                  href="/my-leave"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <CalendarOff size={20} />
                  Verlof
                </a>
              </>
            )}

            <div className="flex items-center gap-2">
              <NotificationBell />
              <a
                href="/account/logout"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Uitloggen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
