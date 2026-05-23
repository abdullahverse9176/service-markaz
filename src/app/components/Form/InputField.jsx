import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const InputField = ({ label, icon: Icon, placeholder, type = "text", registration, error, hint }) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon size={14} className="text-primary" />}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={resolvedType}
          placeholder={placeholder}
          {...registration}
          className={`w-full px-4 py-3 text-sm border rounded-lg outline-none transition focus:ring-2 ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-red-400 focus:ring-red-300 bg-red-50"
              : "border-gray-200 focus:ring-primary focus:border-primary"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
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

export default InputField;