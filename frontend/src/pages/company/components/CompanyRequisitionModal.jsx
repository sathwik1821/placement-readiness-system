import React from 'react';
import { X, Send, Loader2 } from 'lucide-react';

export default function CompanyRequisitionModal({
  isOpen,
  onClose,
  newDrive,
  setNewDrive,
  onSubmit,
  submitting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Campus Recruitment Intake
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Submit Campus Hiring Requisition (JAF)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Drive Title / Announcement *
              </label>
              <input
                type="text"
                required
                value={newDrive.title}
                onChange={(e) => setNewDrive({ ...newDrive, title: e.target.value })}
                placeholder="e.g. TechCorp Graduate Cloud & AI Hiring 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Job Role / Designation *
              </label>
              <input
                type="text"
                required
                value={newDrive.jobRole}
                onChange={(e) => setNewDrive({ ...newDrive, jobRole: e.target.value })}
                placeholder="e.g. Associate Software Engineer - Cloud"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                CTC Package (LPA) *
              </label>
              <input
                type="text"
                required
                value={newDrive.ctc}
                onChange={(e) => setNewDrive({ ...newDrive, ctc: e.target.value })}
                placeholder="e.g. 15.5 LPA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Work Mode *
              </label>
              <select
                value={newDrive.workMode}
                onChange={(e) => setNewDrive({ ...newDrive, workMode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hiring Location
              </label>
              <input
                type="text"
                value={newDrive.location}
                onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                placeholder="e.g. Bangalore / Hyderabad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={newDrive.deadline}
                onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Institutional Eligibility Constraints */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
              Institutional Candidate Eligibility Constraints
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Min CGPA Cutoff
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newDrive.minCgpa}
                  onChange={(e) => setNewDrive({ ...newDrive, minCgpa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Max Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newDrive.maxBacklogs}
                  onChange={(e) => setNewDrive({ ...newDrive, maxBacklogs: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Eligible Batch / Year
                </label>
                <select
                  value={newDrive.targetBatch}
                  onChange={(e) => setNewDrive({ ...newDrive, targetBatch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium"
                >
                  <option value="ALL">All Batches (E4 & E3)</option>
                  <option value="2027">4th Year (E4) • 2027 Only</option>
                  <option value="2028">3rd Year (E3) • 2028 Only</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Eligible Branches
                </label>
                <input
                  type="text"
                  value={newDrive.departments}
                  onChange={(e) => setNewDrive({ ...newDrive, departments: e.target.value })}
                  placeholder="CSE, ECE, ME or ALL"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white mb-1.5"
                />
                <div className="flex flex-wrap gap-1 items-center">
                  {['ALL', 'CSE', 'ECE', 'ME', 'CE', 'CHE', 'MME'].map((dept) => {
                    const isSelected =
                      (newDrive.departments === 'ALL' && dept === 'ALL') ||
                      (dept !== 'ALL' && newDrive.departments?.includes(dept));
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          if (dept === 'ALL') {
                            setNewDrive({ ...newDrive, departments: 'ALL' });
                          } else {
                            const current =
                              newDrive.departments === 'ALL' || !newDrive.departments
                                ? []
                                : newDrive.departments.split(',').map((d) => d.trim()).filter(Boolean);
                            const updated = current.includes(dept)
                              ? current.filter((d) => d !== dept)
                              : [...current, dept];
                            setNewDrive({ ...newDrive, departments: updated.join(', ') });
                          }
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Job Description & Key Technical Stack Requirements
            </label>
            <textarea
              rows={3}
              value={newDrive.jobDescription}
              onChange={(e) => setNewDrive({ ...newDrive, jobDescription: e.target.value })}
              placeholder="Describe core duties, preferred skills (e.g. Java, Python, React, AWS, Docker), and interview assessment rounds..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Requisition...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Drive Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
