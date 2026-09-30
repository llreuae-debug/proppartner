import React, { useState, useEffect } from 'react';
import { Star, Clock, Sparkles, Plus, BookmarkPlus, FolderOpen, ChevronRight, X, Layers, Check } from 'lucide-react';
import { api } from '../../services/api';

/**
 * Favorites & Prescription Templates Quick Bar
 */
export default function FavoritesAndTemplatesBar({
  onSelectFavorite,
  onApplyTemplate,
  onSaveCurrentAsTemplate,
  currentMedicinesCount = 0
}) {
  const [favorites, setFavorites] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const loadFavoritesAndTemplates = async () => {
    try {
      setLoading(true);
      const [favRes, tplRes] = await Promise.all([
        api.getFavoriteMedicines(),
        api.getTemplates()
      ]);
      setFavorites(favRes.favorites || []);
      setTemplates(tplRes.templates || []);
    } catch (err) {
      console.warn("Failed to load favorites/templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavoritesAndTemplates();
  }, []);

  const handleSaveTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    try {
      await onSaveCurrentAsTemplate(newTemplateName.trim());
      setIsSaveModalOpen(false);
      setNewTemplateName('');
      loadFavoritesAndTemplates();
    } catch (err) {
      alert("Failed to save template: " + err.message);
    }
  };

  return (
    <div className="bg-slate-50/80 dark:bg-slate-850/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Quick Formulary & Favorites</span>
        </div>

        <div className="flex items-center gap-2">
          {currentMedicinesCount > 0 && (
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1 shadow-xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save as Template</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Templates ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Starred / Favorite Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <button
              key={fav.id}
              type="button"
              onClick={() => onSelectFavorite(fav)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-teal-50 hover:border-teal-400 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 group"
            >
              <Star className="w-3 h-3 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>{fav.brand_name}</span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono font-medium">{fav.strength}</span>
            </button>
          ))
        ) : (
          <div className="text-[11px] text-slate-400 italic">
            Star frequently prescribed medications in the search bar to pin them here for 1-click prescribing.
          </div>
        )}
      </div>

      {/* Prescription Templates Drawer / Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-gradient-to-r from-teal-700 to-medblue-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5" />
                <h3 className="text-base font-bold">Prescription Templates</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {templates.length > 0 ? (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {tpl.name}
                        </h4>
                        {tpl.diagnosis && (
                          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                            Diagnosis: {tpl.diagnosis}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onApplyTemplate(tpl);
                          setIsTemplateModalOpen(false);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Insert Template</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Medicines ({tpl.items?.length || 0}):</strong>{' '}
                      {(tpl.items || []).map(i => `${i.medicine_name || i.name} (${i.strength || ''})`).join(', ')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No prescription templates created yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-teal-600" />
                <span>Save Current Prescription as Template</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute URTI with Fever, GERD First-Line, Hypertension Standard..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  autoFocus
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                This template will save all current medicines, dosages, frequencies, and instructions for fast reuse in future consultations.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
