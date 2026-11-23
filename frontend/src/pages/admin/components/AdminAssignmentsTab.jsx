import React from 'react';
import {
  Search,
  FolderPlus,
  ClipboardList,
  Edit3,
  Trash2,
  Target,
  Building2,
  Clock,
  Award,
  BookOpen,
  PlusCircle
} from 'lucide-react';

export default function AdminAssignmentsTab({
  categories,
  filteredCategories,
  questions,
  assignmentSearch,
  setAssignmentSearch,
  assignmentTypeFilter,
  setAssignmentTypeFilter,
  openCreateCategoryModal,
  openEditCategoryModal,
  setCategoryToDelete,
  setSelectedCatFilter,
  setActiveTab,
  openAddQuestionForCategory
}) {
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search assignments by title, domain, or target branches..."
            value={assignmentSearch}
            onChange={(e) => setAssignmentSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={assignmentTypeFilter}
            onChange={(e) => setAssignmentTypeFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Test Types</option>
            <option value="MOCK">Mock Assessments</option>
            <option value="TECHNICAL">Technical Engineering</option>
            <option value="ASSIGNMENT">Custom Assignments</option>
            <option value="COMMON">Common Foundational</option>
          </select>

          <button
            onClick={openCreateCategoryModal}
            className="btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 font-bold shrink-0 cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-8">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Assessment Suites Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {assignmentSearch || assignmentTypeFilter !== 'ALL'
                ? 'No assignments match your search or type filter.'
                : 'Click "Create Assignment" to launch a new targeted assessment or mock test.'}
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const qCount = questions.filter(
              (q) => q.testCategoryId === cat.id || q.category?.id === cat.id
            ).length;

            let targetYearsArr = [];
            if (Array.isArray(cat.targetYearsList)) {
              targetYearsArr = cat.targetYearsList;
            } else if (typeof cat.targetYears === 'string') {
              try {
                const parsed = JSON.parse(cat.targetYears);
                targetYearsArr = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                targetYearsArr = [];
              }
            }

            let targetDeptsArr = [];
            if (Array.isArray(cat.targetDepartmentsList)) {
              targetDeptsArr = cat.targetDepartmentsList;
            } else if (typeof cat.targetDepartments === 'string') {
              try {
                const parsed = JSON.parse(cat.targetDepartments);
                targetDeptsArr = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                targetDeptsArr = [];
              }
            }

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header with Type & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                            cat.type === 'MOCK'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : cat.type === 'ASSIGNMENT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : cat.type === 'COMMON'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {cat.type || 'TECHNICAL'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {cat.domain || 'All Domains'}
                        </span>
                        {cat.isActive === false && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit assignment settings"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {cat.description || 'Custom institutional assessment suite for skill calibration and practice.'}
                  </p>

                  {/* Targeting Badges */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span>Target Batches (Years):</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {targetYearsArr.length === 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            All Batches (E1 - E4)
                          </span>
                        ) : (
                          <span className="flex flex-wrap gap-1">
                            {targetYearsArr.map((y, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[11px]">
                                E{String(y).replace(/[^0-9]/g, '')}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Target Branches:</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {targetDeptsArr.length === 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            All Branches
                          </span>
                        ) : (
                          <span className="flex flex-wrap gap-1">
                            {targetDeptsArr.map((d, idx) => (
                              <span key={idx} className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[11px]">
                                {d}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Duration: <strong>{cat.durationMinutes || 30} mins</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-slate-400" />
                        <span>Pass Mark: <strong>{cat.passingPercentage || 60}%</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{qCount} Questions in Bank</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCatFilter(cat.id);
                        setActiveTab('QUESTIONS');
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      View Questions
                    </button>

                    <button
                      onClick={() => openAddQuestionForCategory(cat.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Questions</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
