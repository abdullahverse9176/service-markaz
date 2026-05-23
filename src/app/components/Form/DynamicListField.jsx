import { AlertCircle, Plus, Trash2 } from "lucide-react";

const DynamicListField = ({ label, icon: Icon, fields, append, remove, name, placeholder, register, errors, required = true }) => {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          {Icon && <Icon size={14} className="text-blue-500" />}
          {label}
        </label>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                {...register(`${name}.${index}.value`, required ? { required: "This field is required" } : {})}
                placeholder={placeholder}
                className={`w-full px-4 py-3 text-sm border rounded-lg outline-none transition focus:ring-2 ${
                  errors?.[name]?.[index]?.value
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-400"
                }`}
              />
              {errors?.[name]?.[index]?.value && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors[name][index].value.message}
                </p>
              )}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition"
        >
          <Plus size={15} /> Add more
        </button>
      </div>
    </div>
  );
};

export default DynamicListField;
