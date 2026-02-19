'use client';

import { useUserRole } from '@/hooks/useUserRole';
import WeekPattern from '@/components/Availability/WeekPattern';
import ExceptionsList from '@/components/Availability/ExceptionsList';
import { useState } from 'react';

export default function AvailabilityPage() {
  const { user, userRole, employeeId, loading } = useUserRole();
  const [activeTab, setActiveTab] = useState('pattern');

  if (loading) return <div className="p-8">Laden...</div>;

  if (!user) return <div className="p-8">Niet ingelogd</div>;

  if (userRole !== 'beveiliger' && userRole !== 'planner' && userRole !== 'admin') {
    return <div className="p-8">Geen toegang. Rol: {userRole}</div>;
  }

  // NOTE: Voor admins/planners zou dit een selector moeten zijn.
  // Voor nu focussen we op de 'beveiliger' view (eigen beschikbaarheid).
  // Als admin geen employee_id heeft, toon melding.
  if (!employeeId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Beschikbaarheid</h1>
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
          ⚠️ Je gebruikersaccount is niet gekoppeld aan een medewerker profiel.
          <br />
          Hierdoor kun je geen eigen beschikbaarheid opgeven.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mijn Beschikbaarheid</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('pattern')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'pattern' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Weekpatroon
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'exceptions' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Uitzonderingen
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'pattern' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Vaste Weekpatroon</h2>
              <p className="text-gray-500 mb-6">Geef aan op welke dagen je standaard beschikbaar bent.</p>
              <WeekPattern employeeId={employeeId} />
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Afwijkingen & Vakanties</h2>
              <p className="text-gray-500 mb-6">Voeg datums toe waarop je NIET beschikbaar bent (bijv. vakantie, doktersafspraak).</p>
              <ExceptionsList employeeId={employeeId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
