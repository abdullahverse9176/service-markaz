import { AlertCircle, ChevronDown } from "lucide-react";

const SelectBox = ({ label, icon: Icon, options, placeholder, registration, error }) => {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon size={14} className="text-primary" />}
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...registration}
          className={`w-full px-4 py-3 text-sm border rounded-lg outline-none appearance-none transition focus:ring-2 pr-10 ${
            error
              ? "border-red-400 focus:ring-red-300 bg-red-50"
              : "border-gray-200 focus:ring-primary focus:border-primary"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectBox;