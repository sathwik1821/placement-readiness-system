import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminQuestionModal({
  isOpen,
  onClose,
  editingQuestionId,
  questionForm,
  setQuestionForm,
  categories,
  questionError,
  submittingQ,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-black text-gray-900">
              {editingQuestionId ? 'Edit Assessment Question' : 'Add Question to Repository'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Define multi-choice question, designated correct answer, and explanation for student practice review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {questionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{questionError}</span>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Target Assignment / Test Category *
            </label>
            <select
              required
              value={questionForm.testCategoryId}
              onChange={(e) => setQuestionForm({ ...questionForm, testCategoryId: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type} • {c.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Question Text / Statement *
            </label>
            <textarea
              required
              rows={3}
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
              placeholder="e.g. In Java, what is the default capacity of an ArrayList when it is created without specifying an initial capacity?"
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Options & Correct Answer Selection *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'optionA', label: 'Option A' },
                { key: 'optionB', label: 'Option B' },
                { key: 'optionC', label: 'Option C' },
                { key: 'optionD', label: 'Option D' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                    {questionForm[key] && (
                      <label className="inline-flex items-center gap-1 cursor-pointer text-xs font-bold text-blue-600">
                        <input
                          type="radio"
                          name="correctAnswerSelect"
                          checked={questionForm.correctAnswer === questionForm[key]}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: questionForm[key] })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Mark Correct</span>
                      </label>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={questionForm[key]}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        [key]: val,
                        correctAnswer: prev.correctAnswer === prev[key] ? val : prev.correctAnswer
                      }));
                    }}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {questionForm.correctAnswer && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Designated Correct Answer: <strong className="underline">{questionForm.correctAnswer}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Explanation / Solution Rationale (Shown upon student review)
            </label>
            <textarea
              rows={2}
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              placeholder="e.g. When an ArrayList is instantiated using the default constructor ArrayList(), an empty array is initially allocated. Upon adding the first element, the capacity is expanded to 10."
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Topic / Tag</label>
              <input
                type="text"
                value={questionForm.topic}
                placeholder="e.g. Collections Framework"
                onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Marks (+ / -)</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={questionForm.marks}
                  onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                  className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
                <input
                  type="number"
                  step="0.25"
                  value={questionForm.negativeMarks}
                  onChange={(e) => setQuestionForm({ ...questionForm, negativeMarks: e.target.value })}
                  className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-rose-700"
                />
              </div>
            </div>
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
              disabled={submittingQ}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              {submittingQ ? 'Saving Question...' : editingQuestionId ? 'Update Question' : 'Save to Question Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
