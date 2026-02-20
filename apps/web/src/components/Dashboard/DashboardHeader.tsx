import { Calendar, Users, Building2, MapPin, Clock, ArrowLeftRight, FileText, CalendarOff, LogOut } from "lucide-react";
import NotificationBell from "../NotificationBell";

export function DashboardHeader({ isPlannerOrAdmin }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="flex flex-col xl:flex-row gap-6 justify-between items-stretch xl:items-center w-full">

          {/* Top bar on Mobile: Title + Systeem Acties */}
          <div className="flex justify-between items-start w-full xl:w-auto">
            {/* Zone 1: Title & Info */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Beveiligingsplanning
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {isPlannerOrAdmin
                  ? "Beheer je personeel, klanten en roosters"
                  : "Mijn Planning"}
              </p>
            </div>

            {/* Zone 3 (Mobile view): Systeem Acties */}
            <div className="flex xl:hidden flex-col items-end gap-3 shrink-0">
              <a
                href="/account/logout"
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                title="Uitloggen"
              >
                <LogOut size={20} strokeWidth={2.5} />
              </a>
              <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100">
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Buttons */}
          <div className="flex-1 flex justify-start xl:justify-center w-full">
            {isPlannerOrAdmin ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full xl:w-auto">
                {/* Row 1 */}
                <a href="/clients" className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <Building2 size={18} />
                  <span>Klanten</span>
                </a>
                <a href="/assignments" className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <MapPin size={18} />
                  <span>Opdrachten</span>
                </a>
                <a href="/employees" className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <Users size={18} />
                  <span>Medewerkers</span>
                </a>
                {/* Row 2 */}
                <a href="/facturatie/uren" className="px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <FileText size={18} />
                  <span>Facturatie</span>
                </a>
                <a href="/planning" className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <Calendar size={18} />
                  <span>Planning</span>
                </a>
                <a href="/planning/reports" className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm">
                  <FileText size={18} />
                  <span>Rapportage</span>
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <a href="/beschikbaarheid" className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm flex-1 sm:flex-none">
                  <Clock size={18} />
                  <span>Beschikbaarheid</span>
                </a>
                <a href="/diensten-ruilen" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm flex-1 sm:flex-none">
                  <ArrowLeftRight size={18} />
                  <span>Ruilen</span>
                </a>
                <a href="/my-leave" className="px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2 shadow-sm font-medium text-sm w-full sm:w-auto">
                  <CalendarOff size={18} />
                  <span>Verlof</span>
                </a>
              </div>
            )}
          </div>

          {/* Zone 3 (Desktop view): Systeem Acties (Verticaal) */}
          <div className="hidden xl:flex flex-col items-end gap-3 shrink-0 min-w-[140px]">
            <a
              href="/account/logout"
              className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm text-sm font-medium flex justify-center items-center gap-2 border border-gray-200"
            >
              <LogOut size={16} strokeWidth={2.5} />
              <span>Uitloggen</span>
            </a>
            <div className="px-2 py-1 bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center min-w-full">
              <NotificationBell />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
