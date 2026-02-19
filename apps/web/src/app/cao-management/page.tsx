"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  FileText,
  Edit2,
  Upload,
} from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function CaoManagementPage() {
  const queryClient = useQueryClient();
  const [upload] = useUpload();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteWizard, setDeleteWizard] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    max_hours_per_day: "",
    max_hours_per_week: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["cao-types"],
    queryFn: async () => {
      const response = await fetch("/api/cao-types");
      if (!response.ok) throw new Error("Failed to fetch CAO types");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/cao-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create CAO type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cao-types"]);
      setIsAdding(false);
      setFormData({
        name: "",
        max_hours_per_day: "",
        max_hours_per_week: "",
        description: "",
      });
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/cao-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update CAO type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cao-types"]);
      queryClient.invalidateQueries(["employees"]);
      setEditingId(null);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/cao-types/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete CAO type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cao-types"]);
      queryClient.invalidateQueries(["employees"]);
      setDeleteWizard(null);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleFileUpload = async (file, caoId) => {
    if (!file) return;

    setUploadProgress((prev) => ({ ...prev, [caoId]: "Uploaden..." }));

    const { url, error: uploadError } = await upload({ file });

    if (uploadError) {
      setError(`Fout bij uploaden: ${uploadError}`);
      setUploadProgress((prev) => ({ ...prev, [caoId]: null }));
      return;
    }

    updateMutation.mutate({ id: caoId, data: { pdf_document: url } });
    setUploadProgress((prev) => ({ ...prev, [caoId]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      ...formData,
      max_hours_per_day: parseInt(formData.max_hours_per_day),
      max_hours_per_week: parseInt(formData.max_hours_per_week),
    });
  };

  const handleUpdate = (cao) => {
    setError(null);
    updateMutation.mutate({
      id: cao.id,
      data: {
        name: cao.name,
        max_hours_per_day: parseInt(cao.max_hours_per_day),
        max_hours_per_week: parseInt(cao.max_hours_per_week),
        description: cao.description,
      },
    });
  };

  const handleDelete = async (id, name) => {
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const employeeData = await response.json();

      const linkedEmployees = employeeData.employees.filter(
        (emp) => emp.cao_type === name,
      );

      setDeleteWizard({
        caoId: id,
        caoName: name,
        linkedEmployees: linkedEmployees,
        replacementCao:
          caoTypes.length > 1 ? caoTypes.find((c) => c.id !== id)?.name : null,
      });
    } catch (error) {
      console.error("Error checking employees:", error);
      setError("Fout bij controleren van gekoppelde medewerkers");
    }
  };

  const confirmDelete = async (option) => {
    if (!deleteWizard) return;

    try {
      if (
        option === "reassign" &&
        deleteWizard.replacementCao &&
        deleteWizard.linkedEmployees.length > 0
      ) {
        const replacementCaoData = caoTypes.find(
          (c) => c.name === deleteWizard.replacementCao,
        );

        for (const employee of deleteWizard.linkedEmployees) {
          await fetch(`/api/employees/${employee.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cao_type: deleteWizard.replacementCao,
              max_hours_per_week: replacementCaoData.max_hours_per_week,
              max_hours_per_day: replacementCaoData.max_hours_per_day,
            }),
          });
        }
      }

      deleteMutation.mutate(deleteWizard.caoId);
    } catch (error) {
      console.error("Error during deletion:", error);
      setError("Fout bij verwijderen");
    }
  };

  const startEditing = (cao) => {
    setEditingId(cao.id);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Laden...</div>
      </div>
    );
  }

  const caoTypes = data?.caoTypes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/employees"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Terug naar Medewerkers
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CAO Beheer</h1>
              <p className="text-gray-600 mt-1">
                Beheer alle CAO types en regels
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              {isAdding ? "Annuleren" : "Nieuwe CAO"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Nieuwe CAO Toevoegen
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  CAO Naam
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bijv. CAO Particuliere Beveiliging"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max uren per dag
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="24"
                    value={formData.max_hours_per_day}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_hours_per_day: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max uren per week
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="168"
                    value={formData.max_hours_per_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_hours_per_week: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Beschrijving
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Extra informatie over dit CAO type..."
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {createMutation.isPending ? "Opslaan..." : "CAO Opslaan"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {caoTypes.map((cao) => (
            <div
              key={cao.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {editingId === cao.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      CAO Naam
                    </label>
                    <input
                      type="text"
                      value={cao.name}
                      onChange={(e) => {
                        const updated = caoTypes.map((c) =>
                          c.id === cao.id ? { ...c, name: e.target.value } : c,
                        );
                        queryClient.setQueryData(["cao-types"], {
                          caoTypes: updated,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Max uren per dag
                      </label>
                      <input
                        type="number"
                        value={cao.max_hours_per_day}
                        onChange={(e) => {
                          const updated = caoTypes.map((c) =>
                            c.id === cao.id
                              ? { ...c, max_hours_per_day: e.target.value }
                              : c,
                          );
                          queryClient.setQueryData(["cao-types"], {
                            caoTypes: updated,
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Max uren per week
                      </label>
                      <input
                        type="number"
                        value={cao.max_hours_per_week}
                        onChange={(e) => {
                          const updated = caoTypes.map((c) =>
                            c.id === cao.id
                              ? { ...c, max_hours_per_week: e.target.value }
                              : c,
                          );
                          queryClient.setQueryData(["cao-types"], {
                            caoTypes: updated,
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Beschrijving
                    </label>
                    <textarea
                      value={cao.description || ""}
                      onChange={(e) => {
                        const updated = caoTypes.map((c) =>
                          c.id === cao.id
                            ? { ...c, description: e.target.value }
                            : c,
                        );
                        queryClient.setQueryData(["cao-types"], {
                          caoTypes: updated,
                        });
                      }}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(cao)}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {updateMutation.isPending ? "Opslaan..." : "Opslaan"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {cao.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Max {cao.max_hours_per_day}u/dag,{" "}
                        {cao.max_hours_per_week}u/week
                      </p>
                      {cao.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {cao.description}
                        </p>
                      )}
                      {cao.last_updated && (
                        <p className="text-xs text-gray-500 mt-2">
                          Laatst aangepast:{" "}
                          {new Date(cao.last_updated).toLocaleDateString(
                            "nl-NL",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(cao)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleDelete(cao.id, cao.name)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          CAO Document (PDF)
                        </span>
                      </div>
                      {cao.pdf_document ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={cao.pdf_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                          >
                            Bekijken
                          </a>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                              handleFileUpload(e.target.files[0], cao.id)
                            }
                            className="hidden"
                            id={`pdf-upload-${cao.id}`}
                          />
                          <label
                            htmlFor={`pdf-upload-${cao.id}`}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm flex items-center gap-1"
                          >
                            <Upload size={14} />
                            Vervangen
                          </label>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                              handleFileUpload(e.target.files[0], cao.id)
                            }
                            className="hidden"
                            id={`pdf-upload-${cao.id}`}
                          />
                          <label
                            htmlFor={`pdf-upload-${cao.id}`}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm flex items-center gap-1"
                          >
                            <Upload size={14} />
                            Uploaden
                          </label>
                        </div>
                      )}
                    </div>
                    {uploadProgress[cao.id] && (
                      <p className="text-sm text-green-600 mt-2">
                        {uploadProgress[cao.id]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {caoTypes.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Nog geen CAO types
            </h3>
            <p className="text-gray-600 mb-4">
              Voeg je eerste CAO type toe om te beginnen
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nieuwe CAO
            </button>
          </div>
        )}
      </div>

      {/* Delete Wizard Modal */}
      {deleteWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              CAO "{deleteWizard.caoName}" Verwijderen
            </h3>

            {deleteWizard.linkedEmployees.length > 0 ? (
              <>
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-semibold mb-2">
                    ⚠️ Let op: Dit CAO type is gekoppeld aan{" "}
                    {deleteWizard.linkedEmployees.length} medewerker(s)
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {deleteWizard.linkedEmployees.map((emp) => (
                        <li key={emp.id}>
                          •{" "}
                          {emp.first_name && emp.last_name
                            ? `${emp.first_name} ${emp.last_name}`
                            : emp.name}{" "}
                          ({emp.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">Kies een optie:</p>

                <div className="space-y-3">
                  {caoTypes.filter((c) => c.id !== deleteWizard.caoId).length >
                    0 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteOption"
                          checked={deleteWizard.replacementCao !== null}
                          onChange={() => {
                            const firstOtherCao = caoTypes.find(
                              (c) => c.id !== deleteWizard.caoId,
                            );
                            setDeleteWizard({
                              ...deleteWizard,
                              replacementCao: firstOtherCao?.name,
                            });
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-2">
                            Medewerkers verplaatsen naar ander CAO type
                          </div>
                          <select
                            value={deleteWizard.replacementCao || ""}
                            onChange={(e) =>
                              setDeleteWizard({
                                ...deleteWizard,
                                replacementCao: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={deleteWizard.replacementCao === null}
                          >
                            {caoTypes
                              .filter((c) => c.id !== deleteWizard.caoId)
                              .map((cao) => (
                                <option key={cao.id} value={cao.name}>
                                  {cao.name} ({cao.max_hours_per_day}u/dag,{" "}
                                  {cao.max_hours_per_week}u/week)
                                </option>
                              ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Alle {deleteWizard.linkedEmployees.length}{" "}
                            medewerker(s) krijgen automatisch de uren van het
                            nieuwe CAO type
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-red-500 transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteOption"
                        checked={deleteWizard.replacementCao === null}
                        onChange={() =>
                          setDeleteWizard({
                            ...deleteWizard,
                            replacementCao: null,
                          })
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Toch verwijderen (gevaarlijk)
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          De medewerkers blijven behouden maar hebben geen
                          geldig CAO type meer. Je moet ze handmatig aanpassen.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteWizard(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() =>
                      confirmDelete(
                        deleteWizard.replacementCao ? "reassign" : "force",
                      )
                    }
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending
                      ? "Verwijderen..."
                      : deleteWizard.replacementCao
                        ? "Verplaatsen en Verwijderen"
                        : "Toch Verwijderen"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-6">
                  Dit CAO type is niet gekoppeld aan medewerkers. Weet je zeker
                  dat je het wilt verwijderen?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteWizard(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => confirmDelete("force")}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending
                      ? "Verwijderen..."
                      : "Verwijderen"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
