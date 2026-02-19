import { Upload, X, Image as ImageIcon } from "lucide-react";

export function ProfilePhotoUpload({
  photoUrl,
  onUpload,
  onRemove,
  isUploading,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ImageIcon size={20} />
        Profielfoto
      </h3>
      {photoUrl ? (
        <div className="space-y-3">
          <img
            src={photoUrl}
            alt="Profile"
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload("profile_photo", e.target.files)}
                disabled={isUploading}
              />
              <div className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-semibold">
                {isUploading ? "Uploaden..." : "Vervangen"}
              </div>
            </label>
            <button
              onClick={() => onRemove("profile_photo")}
              disabled={isUploading}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload("profile_photo", e.target.files)}
            disabled={isUploading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">
              {isUploading ? "Uploaden..." : "Klik om foto te uploaden"}
            </p>
          </div>
        </label>
      )}
    </div>
  );
}
