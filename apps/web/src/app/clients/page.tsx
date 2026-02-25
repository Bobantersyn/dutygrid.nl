"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Plus, Trash2, Mail, Phone, MapPin,
  Search, Filter, Euro, User as UserIcon, Tag,
  LayoutGrid, List as ListIcon, ChevronRight,
  MoreVertical, Edit2, X, AlertCircle
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

  // Assignment Form State
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    client_id: "",
    location_name: "",
    location_address: "",
    description: "",
    hourly_rate: "",
  });

  // Assignment Edit State
  const [editAssignment, setEditAssignment] = useState<any>(null);

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

  const createClientMutation = useMutation({
    mutationFn: async (newClient: any) => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!response.ok) throw new Error("Failed to create client");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowClientForm(false);
      setClientFormData({ name: "", contact_person: "", email: "", phone: "", address: "" });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (newAssignment: any) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setShowAssignmentForm(false);
      setAssignmentFormData({ client_id: "", location_name: "", location_address: "", description: "", hourly_rate: "" });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setEditAssignment(null);
    },
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(clientFormData);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignmentMutation.mutate(assignmentFormData);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAssignment) return;
    updateAssignmentMutation.mutate({
      id: editAssignment.id,
      data: {
        location_name: editAssignment.location_name,
        description: editAssignment.description,
        location_address: editAssignment.location_address,
        hourly_rate: editAssignment.hourly_rate
      }
    });
  };

  const toggleAssignmentStatus = (id: string, currentStatus: boolean) => {
    updateAssignmentMutation.mutate({ id, data: { active: !currentStatus } });
  };

  const clients = clientsData?.clients || [];
  const assignments = assignmentsData?.assignments || [];

  // Tab Header Component
  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (searchQuery && id === "klanten") setSearchQuery(""); // auto clear search when clicking main clients tab
      }}
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
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClientForm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Building2 size={18} />
                  <span className="hidden sm:inline">Nieuwe Klant</span>
                </button>
                <button
                  onClick={() => setShowAssignmentForm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Nieuwe Opdracht</span>
                </button>
              </div>
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

        {/* Helper Context Banner when filtered from external click */}
        {searchQuery && activeTab !== "klanten" && (
          <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-700">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter size={16} />
              Je bekijkt nu resultaten gefilterd op: <strong>&quot;{searchQuery}&quot;</strong>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("klanten");
              }}
              className="text-xs font-bold uppercase tracking-wider hover:text-blue-900 underline flex items-center gap-1"
            >
              <X size={14} /> Terug naar alle Klanten
            </button>
          </div>
        )}

        {/* Tab 1: Klantenoverzicht */}
        {activeTab === "klanten" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients
              .filter((c: any) => (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
              .map((client: any) => (
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
                    <button
                      onClick={() => {
                        setActiveTab("contacten");
                        setSearchQuery(client.name);
                      }}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
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
                    (a.location_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (a.client_name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
                        <button
                          onClick={() => toggleAssignmentStatus(assignment.id, assignment.status === 'active')}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${assignment.status === 'active'
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            }`}
                          title={`Klik om dit object ${assignment.status === 'active' ? 'inactief' : 'actief'} te maken`}
                        >
                          {assignment.status === 'active' ? "Actief" : "Inactief"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setEditAssignment({ ...assignment })}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-blue-600 transition-colors"
                        >
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
            {clients
              .filter((c: any) => (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
              .map((client: any) => (
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

      {/* Edit Assignment Modal */}
      {editAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Opdracht Bewerken</h3>
              <button
                onClick={() => setEditAssignment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locatienaam / Opdracht</label>
                <input
                  type="text"
                  required
                  value={editAssignment.location_name}
                  onChange={(e) => setEditAssignment({ ...editAssignment, location_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                <textarea
                  rows={2}
                  value={editAssignment.description || ""}
                  onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={editAssignment.location_address || ""}
                    onChange={(e) => setEditAssignment({ ...editAssignment, location_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uurtarief (€)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={editAssignment.hourly_rate || ""}
                    onChange={(e) => setEditAssignment({ ...editAssignment, hourly_rate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setEditAssignment(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={updateAssignmentMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
                >
                  {updateAssignmentMutation.isPending ? "Opslaan..." : "Wijzigingen Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Nieuwe Klant Toevoegen</h3>
              <button
                onClick={() => setShowClientForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="Bv. Example Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contactpersoon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={clientFormData.contact_person}
                    onChange={(e) => setClientFormData({ ...clientFormData, contact_person: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="Bv. John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={clientFormData.phone}
                      onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="06 12345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={clientFormData.email}
                      onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="info@bedrijf.nl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresgegevens</label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <textarea
                    rows={2}
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                    placeholder="Straat 123, 1000 AA Amsterdam"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowClientForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {createClientMutation.isPending ? "Opslaan..." : "Klant Aanmaken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Nieuwe Opdracht Toevoegen</h3>
              <button
                onClick={() => setShowAssignmentForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Klant *</label>
                <select
                  required
                  value={assignmentFormData.client_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, client_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="" disabled>Selecteer een klant...</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Locatienaam / Object *</label>
                <input
                  type="text"
                  required
                  value={assignmentFormData.location_name}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, location_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Bijv. Hoofdkantoor Amsterdam"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adres *</label>
                <input
                  type="text"
                  required
                  value={assignmentFormData.location_address}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, location_address: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Straat en huisnummer, Postcode Plaats"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Korte Beschrijving</label>
                <textarea
                  value={assignmentFormData.description}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                  placeholder="Optionele details (bijv. specifieke instructies)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Uurtarief (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={assignmentFormData.hourly_rate}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, hourly_rate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={createAssignmentMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createAssignmentMutation.isPending ? "Toevoegen..." : "Opdracht Toevoegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
