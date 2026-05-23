import { AlertCircle } from "lucide-react";

const TextAreaField = ({ label, icon: Icon, placeholder, rows = 4, registration, error, hint }) => {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon size={14} className="text-primary" />}
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...registration}
        className={`w-full px-4 py-3 text-sm border rounded-lg outline-none transition focus:ring-2 resize-none ${
          error
            ? "border-red-400 focus:ring-red-300 bg-red-50"
            : "border-gray-200 focus:ring-primary focus:border-primary"
        }`}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;
