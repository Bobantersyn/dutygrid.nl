import { useState } from "react";
import { useUpload } from "@/utils/useUpload";

export function useEmployeeFileUpload(updateMutation, setError) {
  const [upload] = useUpload();
  const [uploadingField, setUploadingField] = useState(null);

  const handleFileUpload = async (field, files) => {
    if (!files || files.length === 0) return;

    setUploadingField(field);
    try {
      const { url, error: uploadError } = await upload({ file: files[0] });
      if (uploadError) {
        setError(`Fout bij uploaden: ${uploadError}`);
        return;
      }
      if (url) {
        const updates = { [field]: url };
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
