"use client";

import { useState, useRef, useEffect } from "react";
import { AlertCircle, ChevronDown, Search, X } from "lucide-react";

/**
 * Searchable dropdown that shows 5 options by default.
 * Integrates with react-hook-form via Controller (value + onChange props).
 *
 * Props:
 *  label        – field label
 *  icon         – lucide icon component
 *  options      – [{ label, value }]
 *  placeholder  – placeholder text
 *  value        – controlled value (from Controller field.value)
 *  onChange     – controlled change (from Controller field.onChange)
 *  error        – validation error message
 */
export default function SearchableSelect({
  label,
  icon: Icon,
  options = [],
  placeholder = "Select…",
  value,
  onChange,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : options.slice(0, 5);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on click outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon size={14} className="text-primary" />}
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full px-4 py-3 text-sm border rounded-lg outline-none transition text-left flex items-center justify-between ${
            error
              ? "border-red-400 ring-2 ring-red-200 bg-red-50"
              : open
              ? "border-blue-400 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className={selected ? "text-gray-800" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <span
                onClick={handleClear}
                className="text-gray-400 hover:text-red-400 p-0.5 rounded transition"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown
              size={15}
              className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Options list */}
            <ul className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                      opt.value === value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>

            {/* Hint when showing only first 5 */}
            {options.length > 5 && !query && (
              <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 text-center">
                Showing 5 of {options.length} — type to search
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
