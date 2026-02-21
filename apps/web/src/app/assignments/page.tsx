"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  Trash2,
  Building2,
  Euro,
  ToggleLeft,
  ToggleRight,
  Tag,
} from "lucide-react";
import { useState } from "react";

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    location_name: "",
    location_address: "",
    description: "",
    hourly_rate: "",
    active: true,
  });
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [error, setError] = useState(null);

  const { data: labelsData } = useQuery({
    queryKey: ["object-labels"],
    queryFn: async () => {
      const response = await fetch("/api/object-labels");
      if (!response.ok) throw new Error("Failed to fetch labels");
      return response.json();
    }
  });
  const objectLabels = labelsData?.labels || [];

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
  });

  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setShowForm(false);
      setFormData({
        client_id: "",
        location_name: "",
        location_address: "",
        description: "",
        hourly_rate: "",
        active: true,
      });
      setSelectedLabels([]);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setDeleteId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error("Failed to update assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const assignments = assignmentsData?.assignments || [];
  const clients = clientsData?.clients || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      ...formData,
      client_id: parseInt(formData.client_id),
      hourly_rate: formData.hourly_rate
        ? parseFloat(formData.hourly_rate)
        : null,
      object_labels: selectedLabels,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
              >
                ← Terug naar Dashboard
              </a>
              <h1 className="text-3xl font-bold text-gray-900">Opdrachten</h1>
              <p className="text-gray-600 mt-1">
                Beheer bewakingslocaties en opdrachten
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Nieuwe Opdracht
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Nieuwe Opdracht Toevoegen
            </h2>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Klant *
                  </label>
                  <select
                    required
                    value={formData.client_id}
                    onChange={(e) =>
                      setFormData({ ...formData, client_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecteer klant</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Locatie Naam *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Hoofdkantoor Amsterdam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Uurtarief (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourly_rate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="25.50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Locatie Adres *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Zuidas 50, 1082 AB Amsterdam"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Omschrijving
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nachtbewaking kantoorpand..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Vereiste Object Labels (Kwalificaties)
                  </label>
                  {objectLabels.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Geen object labels ingesteld in het systeem.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {objectLabels.map((label) => (
                        <label
                          key={label.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedLabels.includes(label.id)
                              ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedLabels.includes(label.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLabels([...selectedLabels, label.id]);
                              } else {
                                setSelectedLabels(selectedLabels.filter(id => id !== label.id));
                              }
                            }}
                          />
                          <Tag size={16} className={selectedLabels.includes(label.id) ? "text-orange-500" : "text-gray-400"} />
                          {label.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                    setFormData({
                      client_id: "",
                      location_name: "",
                      location_address: "",
                      description: "",
                      hourly_rate: "",
                      active: true,
                    });
                    setSelectedLabels([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Laden...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nog geen opdrachten
            </h3>
            <p className="text-gray-600 mb-6">
              Voeg je eerste opdracht toe om te beginnen
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${assignment.active
                    ? "border-orange-200"
                    : "border-gray-200 opacity-60"
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <MapPin className="text-orange-600" size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: assignment.id,
                          active: !assignment.active,
                        })
                      }
                      className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      {assignment.active ? (
                        <ToggleRight className="text-green-600" size={20} />
                      ) : (
                        <ToggleLeft className="text-gray-400" size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteId(assignment.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {assignment.location_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Building2 size={14} />
                  <span>{assignment.client_name}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{assignment.location_address}</span>
                  </div>
                  {assignment.hourly_rate && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <Euro size={16} />
                      <span>
                        {parseFloat(assignment.hourly_rate).toFixed(2)} per uur
                      </span>
                    </div>
                  )}
                </div>

                {assignment.description && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>
                  </div>
                )}

                {assignment.object_labels && assignment.object_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                    {assignment.object_labels.map((label) => (
                      <span key={label.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        <Tag size={10} />
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                {!assignment.active && (
                  <div className="mt-3 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full inline-block">
                    Inactief
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Opdracht Verwijderen
            </h3>
            <p className="text-gray-600 mb-6">
              Weet je zeker dat je deze opdracht wilt verwijderen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Verwijderen..." : "Verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
