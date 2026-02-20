import { Upload, X } from "lucide-react";

export function DocumentUpload({
  title,
  icon: Icon,
  documentUrl,
  fieldName,
  onUpload,
  onRemove,
  isUploading,
  acceptTypes = "image/*,.pdf",
  viewButtonColor = "green",
}) {
  const colorClasses = {
    green: {
      view: "bg-green-50 text-green-700 hover:bg-green-100",
      border: "hover:border-green-500",
    },
    purple: {
      view: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      border: "hover:border-purple-500",
    },
    blue: {
      view: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      border: "hover:border-blue-500",
    },
  };

  const colors = colorClasses[viewButtonColor] || colorClasses.green;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon size={20} />
        {title}
      </h3>
      {documentUrl ? (
        <div className="space-y-3">
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-4 py-2 ${colors.view} rounded-lg transition-colors text-center`}
          >
            Bekijken
          </a>
          <label className="block cursor-pointer">
            <input
              type="file"
              accept={acceptTypes}
              className="hidden"
              onChange={(e) => onUpload(fieldName, e.target.files)}
              disabled={isUploading}
            />
            <div className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-semibold">
              {isUploading ? "Uploaden..." : "Vervangen"}
            </div>
          </label>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept={acceptTypes}
            className="hidden"
            onChange={(e) => onUpload(fieldName, e.target.files)}
            disabled={isUploading}
          />
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${colors.border} transition-colors`}
          >
            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-600">
              {isUploading ? "Uploaden..." : "Klik om document te uploaden"}
            </p>
          </div>
        </label>
      )}
    </div>
  );
}
