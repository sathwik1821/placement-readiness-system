import React from 'react';
import { X, AlertCircle, FolderPlus, Check } from 'lucide-react';

export default function AdminCategoryModal({
  isOpen,
  onClose,
  editingCategoryId,
  categoryForm,
  setCategoryForm,
  categoryError,
  submittingCat,
  onSave,
  toggleYearSelection,
  toggleDeptSelection,
  allYears,
  allBranches
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                {editingCategoryId ? 'Edit Assignment Settings' : 'Create Assignment / Mock Assessment'}
              </h3>
              <p className="text-xs text-gray-500">
                Define test parameters and restrict visibility by student batch year and branch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {categoryError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{categoryError}</span>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Assignment Title *
            </label>
            <input
              required
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g. Java Mock Assessment, Full Stack Spring Boot Architecture"
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Assessment Type
              </label>
              <select
                value={categoryForm.type}
                onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer"
              >
                <option value="MOCK">MOCK (Mock Assessment / Interview Prep)</option>
                <option value="ASSIGNMENT">ASSIGNMENT (Department Assignment)</option>
                <option value="TECHNICAL">TECHNICAL (Core Engineering / Code)</option>
                <option value="COMMON">COMMON (Verbal / Logical / Aptitude)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Domain / Subject
              </label>
              <input
                type="text"
                value={categoryForm.domain}
                onChange={(e) => setCategoryForm({ ...categoryForm, domain: e.target.value })}
                placeholder="e.g. Java Full Stack, Python, Web Dev"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Target Academic Batches (Years) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Target Academic Years / Batches
              </label>
              <button
                type="button"
                onClick={() => setCategoryForm((prev) => ({ ...prev, targetYears: [] }))}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Open to All Batches
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allYears.map(({ year, label }) => {
                const isSelected = categoryForm.targetYears.includes(year);
                return (
                  <button
                    type="button"
                    key={year}
                    onClick={() => toggleYearSelection(year)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            {categoryForm.targetYears.length === 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                ✓ Currently visible to students across all batch years (E1 to E4).
              </p>
            )}
          </div>

          {/* Target Departments / Branches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Target Branches / Departments
              </label>
              <button
                type="button"
                onClick={() => setCategoryForm((prev) => ({ ...prev, targetDepartments: [] }))}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Open to All Branches
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {allBranches.map(({ code }) => {
                const isSelected = categoryForm.targetDepartments.includes(code);
                return (
                  <button
                    type="button"
                    key={code}
                    onClick={() => toggleDeptSelection(code)}
                    className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            {categoryForm.targetDepartments.length === 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                ✓ Currently visible to students across all engineering branches.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={categoryForm.durationMinutes}
                onChange={(e) => setCategoryForm({ ...categoryForm, durationMinutes: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={categoryForm.passingPercentage}
                onChange={(e) => setCategoryForm({ ...categoryForm, passingPercentage: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description / Instructions for Students
            </label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="e.g. Evaluates object-oriented programming, Spring Boot microservices, JPA/Hibernate, and concurrency."
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-normal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCat}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              {submittingCat ? 'Saving Assignment...' : editingCategoryId ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
