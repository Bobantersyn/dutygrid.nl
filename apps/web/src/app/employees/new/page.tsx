"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Upload, FileText, Image, Shield, Tag } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function NewEmployeePage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    home_address: "",
    job_title: "Beveiliger",
    contract_type: "",
    pass_type: "geen",
    is_flex: false,
    active: true,
  });
  const [error, setError] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passportDoc, setPassportDoc] = useState(null);
  const [securityPass, setSecurityPass] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedLabels, setSelectedLabels] = useState([]);

  const { data: labelsData } = useQuery({
    queryKey: ["object-labels"],
    queryFn: async () => {
      const res = await fetch("/api/object-labels");
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json();
    }
  });

  const objectLabels = labelsData?.labels || [];

  const [upload, { loading: uploadLoading }] = useUpload();

  const handleFileUpload = async (file, type) => {
    if (!file) return null;

    setUploadProgress((prev) => ({ ...prev, [type]: "Uploaden..." }));

    const { url, error: uploadError } = await upload({ file });

    if (uploadError) {
      setError(`Fout bij uploaden ${type}: ${uploadError}`);
      setUploadProgress((prev) => ({ ...prev, [type]: null }));
      return null;
    }

    setUploadProgress((prev) => ({ ...prev, [type]: "Voltooid!" }));
    setTimeout(() => {
      setUploadProgress((prev) => ({ ...prev, [type]: null }));
    }, 2000);

    return url;
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create employee");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/employees";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Upload files first
    const profilePhotoUrl = profilePhoto
      ? await handleFileUpload(profilePhoto, "profile_photo")
      : null;
    const passportDocUrl = passportDoc
      ? await handleFileUpload(passportDoc, "passport_document")
      : null;
    const securityPassUrl = securityPass
      ? await handleFileUpload(securityPass, "security_pass_document")
      : null;

    createMutation.mutate({
      ...formData,
      profile_photo: profilePhotoUrl,
      passport_document: passportDocUrl,
      security_pass_document: securityPassUrl,
      object_labels: selectedLabels,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/employees"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Terug naar Medewerkers
          </a>
          <h1 className="text-3xl font-bold text-gray-900">
            Nieuwe Medewerker
          </h1>
          <p className="text-gray-600 mt-1">
            Voeg een nieuwe medewerker toe aan je team
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Persoonlijke Gegevens
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Voornaam *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Achternaam *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jansen"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="jan@bedrijf.nl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Telefoon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="06-12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Woonadres
              </label>
              <input
                type="text"
                value={formData.home_address}
                onChange={(e) =>
                  setFormData({ ...formData, home_address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Straat 123, 1234 AB Amsterdam"
              />
              <p className="text-xs text-gray-500 mt-1">
                Voor berekening reisafstand en reiskosten
              </p>
            </div>

            {/* Employment Info Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dienstverband
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Functie
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Beveiliger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Contracttype
                  </label>
                  <input
                    type="text"
                    value={formData.contract_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contract_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vast, Tijdelijk, Oproep"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      Type Pas
                    </div>
                  </label>
                  <select
                    value={formData.pass_type}
                    onChange={(e) =>
                      setFormData({ ...formData, pass_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="geen">Geen Pas</option>
                    <option value="grijs">Grijze Pas</option>
                    <option value="groen">Groene Pas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Flexmedewerker
                  </label>
                  <select
                    value={formData.is_flex ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_flex: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="false">Nee, Vaste Krijger</option>
                    <option value="true">Ja, Flex-pool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="true">Actief</option>
                    <option value="false">Inactief</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Documenten & Foto
              </h3>

              <div className="space-y-4">
                {/* Profile Photo */}
                <PhotoUpload
                  onPhotoCropped={(file) => setProfilePhoto(file)}
                  initialPhotoUrl={null}
                  label="Profielfoto (wordt 1:1 bijgesneden)"
                />

                {/* Passport Document */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Paspoort/ID
                    </div>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPassportDoc(e.target.files[0])}
                      className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {uploadProgress.passport_document && (
                      <span className="text-sm text-green-600">
                        {uploadProgress.passport_document}
                      </span>
                    )}
                  </div>
                  {passportDoc && (
                    <p className="text-sm text-gray-600 mt-1">
                      Geselecteerd: {passportDoc.name}
                    </p>
                  )}
                </div>

                {/* Security Pass */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      Beveiligingspas
                    </div>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSecurityPass(e.target.files[0])}
                      className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {uploadProgress.security_pass_document && (
                      <span className="text-sm text-green-600">
                        {uploadProgress.security_pass_document}
                      </span>
                    )}
                  </div>
                  {securityPass && (
                    <p className="text-sm text-gray-600 mt-1">
                      Geselecteerd: {securityPass.name}
                    </p>
                  )}
                </div>
              </div>
            </div>


          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <a
              href="/employees"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Annuleren
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending || uploadLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {createMutation.isPending || uploadLoading
                ? "Opslaan..."
                : "Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
