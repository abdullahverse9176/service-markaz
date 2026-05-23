const FormSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">{title}</h3>
          {subtitle && <p className="text-[11px] sm:text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">{children}</div>
    </div>
  );
};

export default FormSection;
