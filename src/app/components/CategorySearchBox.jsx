"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

/**
 * Controlled category autocomplete search box.
 *
 * Props:
 *  inputValue   – text currently shown in the input (controlled)
 *  onInputChange(text)  – called on every keystroke
 *  onSelect(slug, name) – called when user picks a category
 *  onClear()            – called when X is clicked
 *  placeholder   – input placeholder
 *  inputClassName – extra Tailwind classes for the <input>
 *  className      – wrapper div classes
 */
const CategorySearchBox = ({
  inputValue = "",
  onInputChange,
  onSelect,
  onClear,
  placeholder = "Search category (plumber, electrician…)",
  inputClassName = "",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const { data: allCategories = [] } = useCategories();

  // Filter suggestions: match name OR slug
  const suggestions = inputValue.trim()
    ? allCategories.filter((c) =>
        c.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : allCategories.slice(0, 8);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  }

  function handleSelect(cat) {
    onSelect(cat.slug, cat.name);
    setOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();
    onClear();
    inputRef.current?.focus();
    setOpen(true);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            onInputChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-9 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition ${inputClassName}`}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {!inputValue.trim() && (
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Popular Categories
            </p>
          )}
          <ul className="py-1">
            {suggestions.map((cat) => {
              const Icon = cat.icon;
              return (
                <li key={cat.slug}>
                  <button
                    // prevent the input from losing focus before click registers
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left group"
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform"
                      />
                    )}
                    <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-blue-400 transition"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategorySearchBox;
