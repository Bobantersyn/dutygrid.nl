import { User, Briefcase, Shield, Eye, CalendarClock, Tag } from "lucide-react";
import { Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PersonalInfoFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  home_address?: string;
  job_title?: string;
  contract_type?: string;
  badge_type?: string;
  active?: boolean;
  planning_visibility_weeks?: number;
  can_manage_own_availability?: boolean;
  object_labels?: { id: number; name: string }[];
}

interface PersonalInfoFormProps {
  formData: PersonalInfoFormData;
  setFormData: (data: PersonalInfoFormData) => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function PersonalInfoForm({
  formData,
  setFormData,
  isEditing,
  onSubmit,
  isSubmitting,
}: PersonalInfoFormProps) {
  const { data: labelsData } = useQuery({
    queryKey: ["object-labels"],
    queryFn: async () => {
      const res = await fetch("/api/object-labels");
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json();
    }
  });

  const objectLabels = labelsData?.labels || [];
  const selectedLabelIds = formData?.object_labels?.map(l => l.id) || [];

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User size={24} className="text-blue-600" />
        Persoonlijke Gegevens
      </h2>

      <div className="space-y-6">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Voornaam
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData?.first_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Achternaam
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData?.last_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Telefoon
          </label>
          <input
            type="tel"
            disabled={!isEditing}
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Woonadres
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={formData.home_address || ""}
            onChange={(e) =>
              setFormData({ ...formData, home_address: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            placeholder="Straat 123, 1234 AB Amsterdam"
          />
          <p className="text-xs text-gray-500 mt-1">
            Voor berekening reisafstand en reiskosten
          </p>
        </div>

        {/* Employment Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            Dienstverband
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Functie
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData?.job_title || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    job_title: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Bijv. Beveiliger"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contracttype
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData?.contract_type || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contract_type: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Bijv. Vast, Tijdelijk, Oproep"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Shield size={16} />
                Type Pas
              </label>
              <select
                disabled={!isEditing}
                value={formData?.badge_type || "geen"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badge_type: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="geen">Geen Pas</option>
                <option value="grijs">Grijze Pas</option>
                <option value="groen">Groene Pas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                disabled={!isEditing}
                value={formData?.active ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    active: e.target.value === "true",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="true">Actief</option>
                <option value="false">Inactief</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <Eye size={16} />
              Planning Zichtbaarheid
            </label>
            <select
              disabled={!isEditing}
              value={formData?.planning_visibility_weeks || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  planning_visibility_weeks: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            >
              <option value="1">1 week vooruit</option>
              <option value="2">2 weken vooruit</option>
              <option value="3">3 weken vooruit</option>
              <option value="4">4 weken vooruit</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hoever deze medewerker zijn/haar planning mag zien
            </p>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={formData?.can_manage_own_availability !== false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_manage_own_availability: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <CalendarClock size={16} className="text-purple-600" />
                  Beschikbaarheid Beheren
                </span>
                <p className="text-xs text-gray-500">
                  Medewerker mag eigen beschikbaarheid opgeven
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <Tag size={16} className="text-blue-600" />
              Object Labels (Kwalificaties / Restricties)
            </label>
            {objectLabels.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Geen object labels ingesteld in het systeem.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {objectLabels.map((label) => (
                  <label
                    key={label.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${!isEditing ? "opacity-75 cursor-default" : "cursor-pointer"
                      } ${selectedLabelIds.includes(label.id)
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      className="sr-only"
                      checked={selectedLabelIds.includes(label.id)}
                      onChange={(e) => {
                        let newLabels = formData.object_labels || [];
                        if (e.target.checked) {
                          newLabels = [...newLabels, { id: label.id, name: label.name }];
                        } else {
                          newLabels = newLabels.filter(l => l.id !== label.id);
                        }
                        setFormData({ ...formData, object_labels: newLabels });
                      }}
                    />
                    <Tag size={16} className={selectedLabelIds.includes(label.id) ? "text-blue-500" : "text-gray-400"} />
                    {label.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isSubmitting ? "Opslaan..." : "Wijzigingen opslaan"}
          </button>
        )}
      </div>
    </form>
  );
}
