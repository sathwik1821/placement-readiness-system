import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

export default function CompanyApplicantsDrawer({
  drive,
  applicantsList,
  loading,
  onClose,
  onUpdateStatus,
  onPreviewResume
}) {
  if (!drive) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mt-6">
      <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Active Applicant Review
            </span>
            <span className="text-xs text-slate-500 font-bold font-mono">
              {drive.title} • {drive.jobRole}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Registered Candidate Evaluation Cohort ({applicantsList.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
        >
          Close Drawer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">
          Loading registered candidate cohort...
        </div>
      ) : applicantsList.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-400">
          No students have applied to this drive yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Candidate Name</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">CGPA</th>
                <th className="pb-3">Readiness Index</th>
                <th className="pb-3">Test Accuracy</th>
                <th className="pb-3">Candidate Resume</th>
                <th className="pb-3">Hiring Stage</th>
                <th className="pb-3 pr-2 text-right">Recruiter Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicantsList.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-slate-900">
                    {app.student?.name || 'Candidate #' + app.studentId?.slice(0, 6)}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {app.student?.rollNumber && (
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {app.student.rollNumber}
                        </span>
                      )}
                      <span className="text-xs font-normal text-slate-500 truncate max-w-[170px]">
                        {app.student?.email || 'Registered Student'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">
                    {app.student?.department || 'Engineering'}
                  </td>
                  <td className="py-3.5 font-bold font-mono text-slate-900">
                    {app.student?.cgpa ? app.student.cgpa.toFixed(2) : '8.40'}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      {app.readinessScore ?? 65}%
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {app.averageAccuracy ?? 75}%
                    </span>
                  </td>
                  <td className="py-3.5">
                    {app.resumeUrl ? (
                      <button
                        type="button"
                        onClick={() => onPreviewResume({
                          url: app.resumeUrl,
                          fileName: app.resumeFileName || 'Resume.pdf',
                          candidateName: app.student?.name || 'Candidate'
                        })}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate max-w-[100px]">{app.resumeFileName || 'View Resume'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Not attached</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {app.status !== 'SHORTLISTED' && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status !== 'SELECTED' && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'SELECTED')}
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
