import { useState } from "react";


export function useEmployeeFileUpload(updateMutation, setError) {
  const [uploadingField, setUploadingField] = useState(null);

  const handleFileUpload = async (field, files) => {
    if (!files || files.length === 0) return;

    setUploadingField(field);
    try {
      const file = files[0];
      const base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Fout bij inlezen bestand"));
        reader.readAsDataURL(file);
      });

      if (base64Url) {
        const updates = { [field]: base64Url };
        await updateMutation.mutateAsync(updates);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Fout bij uploaden: ${error.message}`);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveFile = async (field) => {
    if (confirm("Weet je zeker dat je dit bestand wilt verwijderen?")) {
      await updateMutation.mutateAsync({ [field]: null });
    }
  };

  return {
    uploadingField,
    handleFileUpload,
    handleRemoveFile,
  };
}
