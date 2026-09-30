import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Layers, X } from 'lucide-react';
import { DOSAGE_FORM_CATEGORIES, ALL_DOSAGE_FORMS, getFormDetails } from '../../data/dosageForms';

/**
 * Searchable, Categorized Dosage Form Dropdown / Modal Selector
 */
export default function MedicineFormSelector({
  value,
  onChange,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (formName) => {
    const details = getFormDetails(formName);
    onChange(formName, details.defaultRoute);
    setIsOpen(false);
    setSearch('');
  };

  const filteredCategories = DOSAGE_FORM_CATEGORIES.map(cat => {
    let forms = cat.forms;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      forms = forms.filter(f => f.toLowerCase().includes(q));
    }
    return {
      ...cat,
      forms
    };
  }).filter(cat => {
    if (activeCategory !== 'ALL' && cat.category !== activeCategory) return false;
    return cat.forms.length > 0;
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-all shadow-xs"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate capitalize">{value || 'Select Form'}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
          
          {/* Header & Search */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Select Dosage Form</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter dosage forms..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>

            {/* Category Quick Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {['ALL', 'ORAL', 'TOPICAL', 'OPHTHALMIC', 'INHALATION', 'INJECTION', 'RECTAL', 'VAGINAL'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized List */}
          <div className="max-h-64 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div key={cat.category} className="py-2 first:pt-0 last:pb-0">
                  <div className="px-2 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{cat.category}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-normal lowercase">{cat.defaultRoute}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {cat.forms.map((form) => {
                      const isSelected = value && value.toLowerCase() === form.toLowerCase();
                      return (
                        <button
                          key={form}
                          type="button"
                          onClick={() => handleSelect(form)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{form}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching dosage forms found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
