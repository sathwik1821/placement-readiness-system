import React from 'react';
import {
  Search,
  PlusCircle,
  ClipboardList,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3,
  Trash2
} from 'lucide-react';

export default function AdminQuestionsTab({
  questions,
  filteredQuestions,
  categories,
  searchQuery,
  setSearchQuery,
  selectedCatFilter,
  setSelectedCatFilter,
  difficultyFilter,
  setDifficultyFilter,
  openAddQuestionForCategory,
  openEditQuestion,
  setQuestionToDelete,
  expandedQuestionId,
  setExpandedQuestionId
}) {
  return (
    <div className="space-y-5">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search questions by text, explanation, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
          >
            <option value="">All Assignments ({categories.length})</option>
            {categories.map((c) => {
              const cCount = questions.filter(
                (q) => q.testCategoryId === c.id || q.category?.id === c.id
              ).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({cCount} Qs)
                </option>
              );
            })}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <button
            onClick={() =>
              openAddQuestionForCategory(selectedCatFilter || categories[0]?.id || '')
            }
            className="btn-primary text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5 font-bold shrink-0 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-8">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Assessment Questions Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCatFilter || difficultyFilter !== 'ALL'
                ? 'No questions match your current search or category filter.'
                : 'The question bank is currently empty. Click "Add Question" to seed technical questions.'}
            </p>
            {(searchQuery || selectedCatFilter || difficultyFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCatFilter('');
                  setDifficultyFilter('ALL');
                }}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const cat =
              categories.find((c) => c.id === (q.testCategoryId || q.category?.id)) ||
              q.category;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="badge-blue text-xs font-bold">
                        {cat?.name || 'General'}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.difficulty === 'HARD'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {q.topic && (
                        <span className="text-xs text-gray-500 font-medium">
                          Topic: <strong className="text-gray-700">{q.topic}</strong>
                        </span>
                      )}
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        +{q.marks} / -{q.negativeMarks} marks
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                      {q.questionText}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Correct: <strong>{q.correctAnswer}</strong>
                        </span>
                      </span>

                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>
                          {isExpanded
                            ? 'Hide Options & Explanation'
                            : `View Options (${q.options?.length || 0}) & Explanation`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Collapsible Options Drawer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-xs px-3 py-2 rounded-xl border flex items-center justify-between ${
                                opt === q.correctAnswer
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {opt === q.correctAnswer && (
                                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Correct Choice
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Explanation Card */}
                        {q.explanation && (
                          <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl text-xs text-slate-700">
                            <span className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Rationale & Solution Explanation:</span>
                            </span>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setQuestionToDelete(q)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete question permanently"
                    >
                      <Trash2 className="w-4 h-4" />
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
