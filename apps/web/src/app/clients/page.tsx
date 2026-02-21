"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Plus, Trash2, Mail, Phone, MapPin,
  Search, Filter, Euro, User as UserIcon, Tag,
  LayoutGrid, List as ListIcon, ChevronRight,
  MoreVertical, Edit2
} from "lucide-react";
import { useState } from "react";

type TabType = "klanten" | "opdrachten" | "tarieven" | "contacten";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("klanten");
  const [searchQuery, setSearchQuery] = useState("");

  // Client Form State
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  // Queries
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
  });

  const clients = clientsData?.clients || [];
  const assignments = assignmentsData?.assignments || [];

  // Tab Header Component
  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${activeTab === id
          ? "border-blue-600 text-blue-600 font-semibold"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
        }`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Klantbeheer</h1>
              <p className="text-sm text-gray-500 mt-1">Centraal overzicht van al uw klanten en projectlocaties</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
                />
              </div>
              <button
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Nieuwe Klant
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <TabButton id="klanten" label="Klantenoverzicht" icon={Building2} />
            <TabButton id="opdrachten" label="Objecten / Opdrachten" icon={MapPin} />
            <TabButton id="tarieven" label="Tarieven" icon={Euro} />
            <TabButton id="contacten" label="Contactpersonen" icon={UserIcon} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab 1: Klantenoverzicht */}
        {activeTab === "klanten" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client: any) => (
              <div key={client.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{client.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{client.address || "Geen adres"}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Opdrachten</span>
                    <span className="font-semibold text-gray-900">
                      {assignments.filter((a: any) => a.client_id === client.id).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <button className="flex-1 text-xs font-semibold py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("opdrachten");
                      setSearchQuery(client.name);
                    }}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Opdrachten
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Opdrachten */}
        {activeTab === "opdrachten" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Locatie / Opdracht</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Klant</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Adres</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments
                  .filter((a: any) =>
                    a.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.client_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((assignment: any) => (
                    <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{assignment.location_name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{assignment.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          <Building2 size={12} />
                          {assignment.client_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {assignment.location_address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${assignment.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                          {assignment.active ? "Actief" : "Inactief"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Tarieven */}
        {activeTab === "tarieven" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment: any) => (
              <div key={`rate-${assignment.id}`} className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{assignment.location_name}</h4>
                  <p className="text-xs text-gray-500">{assignment.client_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Uurtarief</p>
                  <div className="flex items-center justify-end gap-1 text-lg font-black text-green-600">
                    <Euro size={18} />
                    <span>{parseFloat(assignment.hourly_rate || "0").toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Contactpersonen */}
        {activeTab === "contacten" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client: any) => (
              <div key={`contact-${client.id}`} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <UserIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{client.contact_person || "Geen contactpersoon"}</h4>
                    <p className="text-xs text-blue-600 font-medium">{client.name}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span>{client.email || "Geen e-mail"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{client.phone || "Geen telefoon"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Simple Form Placeholders or Integrated Logic can go here */}
    </div>
  );
}
