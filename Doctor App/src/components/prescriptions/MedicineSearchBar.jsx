import React, { useState, useEffect, useRef } from 'react';
import { Search, Pill, Sparkles, Building2, Package, Star, ChevronRight, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';

/**
 * Smart Live Medicine Search Selector with Keyboard Navigation & Rich DRAP Details
 */
export default function MedicineSearchBar({
  value,
  onSelect,
  placeholder = "Search brand name, generic salt, form, or manufacturer (e.g. 'Daktarin', 'Paracetamol', 'Cream')...",
  autoFocus = false,
  className = ""
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.searchMedicines(searchTerm.trim(), { limit: 20 });
      setResults(res.medicines || []);
      setIsOpen(true);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Medicine search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!text.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchResults(text);
    }, 180);
  };

  const handleFocus = () => {
    if (query.trim().length > 0) {
      fetchResults(query);
      setIsOpen(true);
    }
  };

  const handleSelectMedicine = (med) => {
    setQuery(med.brand_name || med.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(med);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectMedicine(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleToggleFavorite = async (e, med) => {
    e.stopPropagation();
    try {
      await api.toggleFavoriteMedicine(med.id);
      setResults(prev => prev.map(m => m.id === med.id ? { ...m, is_favorite: !m.is_favorite } : m));
    } catch (err) {
      console.warn("Failed to toggle favorite:", err);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-xs"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-teal-600 animate-spin absolute right-3.5" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[360px] overflow-y-auto animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
          
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Pakistan Formulary Live Matches ({results.length})</span>
            <span className="text-teal-600 dark:text-teal-400">↑↓ to navigate • ↵ to select</span>
          </div>

          {results.length > 0 ? (
            results.map((med, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={med.id || index}
                  onClick={() => handleSelectMedicine(med)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/90 dark:bg-teal-950/60 border-l-4 border-teal-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {med.brand_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-[10px] font-mono">
                        {med.strength}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] capitalize">
                        {med.dosage_form || med.form}
                      </span>
                      {med.route && (
                        <span className="px-1.5 py-0.2 rounded bg-medblue-50 dark:bg-medblue-950/50 text-medblue-700 dark:text-medblue-300 text-[9.5px] font-semibold">
                          {med.route}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <span className="italic font-medium text-slate-700 dark:text-slate-300">
                        Generic: {med.generic_name}
                      </span>
                      {med.manufacturer && (
                        <>
                          <span>•</span>
                          <span className="truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {med.manufacturer}
                          </span>
                        </>
                      )}
                      {med.pack_size && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-slate-400">
                            {med.pack_size}
                          </span>
                        </>
                      )}
                    </div>

                    {med.therapeutic_class && (
                      <div className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                        Class: {med.therapeutic_class}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, med)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        med.is_favorite 
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                          : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={med.is_favorite ? "Remove from favorite medicines" : "Star as favorite medicine"}
                    >
                      <Star className={`w-4 h-4 ${med.is_favorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <Pill className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No official formulary match for "{query}"
              </p>
              <p className="text-[11px] text-slate-400">
                Press Enter to use as a custom formulation or select custom medicine.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelect({
                    brand_name: query,
                    generic_name: query,
                    strength: "Standard",
                    dosage_form: "Tablet",
                    route: "Oral",
                    available_strengths: ["Standard"]
                  });
                  setIsOpen(false);
                }}
                className="mt-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-colors inline-flex items-center gap-1"
              >
                <span>+ Use "{query}" as Custom Item</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
