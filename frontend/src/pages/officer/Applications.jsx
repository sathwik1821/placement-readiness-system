import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, Filter, CheckCircle2, XCircle, ArrowLeft, Lock, ShieldAlert, FileText, ExternalLink } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function formatFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Applications() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveId || '');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    async function fetchDrives() {
      try {
        const res = await api.get('/officer/drives');
        setDrives(res.data || []);
        if (!selectedDriveId && res.data?.length > 0) {
          setSelectedDriveId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed fetching drives list', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDrives();
  }, [selectedDriveId]);

  useEffect(() => {
    if (!selectedDriveId) return;
    async function fetchApps() {
      try {
        const res = await api.get(`/officer/drives/${selectedDriveId}/applications`);
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed fetching applications', err);
      }
    }
    fetchApps();
  }, [selectedDriveId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/officer/drives/${selectedDriveId}/applications/${appId}/status`, {
        status: newStatus
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stages = [
    'APPLIED',
    'ASSESSMENT_PENDING',
    'ASSESSMENT_COMPLETED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'SELECTED',
    'NOT_SELECTED'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Multi-Stage Candidate Pipeline Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enforce screening cutoffs, monitor assessment milestones, and manage corporate rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Recruitment Drive:</label>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="input py-1.5 text-xs max-w-xs font-medium"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.jobRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      {(() => {
        const currentDrive = drives.find((d) => d.id === selectedDriveId);
        const isRecruiterPushed = Boolean(currentDrive?.companyId);

        return (
          <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {isRecruiterPushed && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Corporate Recruiter Governed Drive:</strong> Candidate shortlisting and selection decisions for this drive are managed directly by the corporate recruiter. Institutional TPO view is strictly read-only for compliance tracking.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Applicant Roster ({applications.length} Candidates)</span>
              </h2>
              {isRecruiterPushed && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Corporate Managed</span>
                </span>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No student applications logged for this recruitment drive yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Candidate Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Academic CGPA</th>
                      <th className="py-3 px-4">Target Role</th>
                      <th className="py-3 px-4">Resume</th>
                      <th className="py-3 px-4">Current Pipeline Stage</th>
                      <th className="py-3 px-4 text-right">
                        {isRecruiterPushed ? 'Authority' : 'Update Selection Status'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => {
                      const student = app.student;
                      return (
                        <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {student?.name}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {student?.rollNumber && (
                                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  {student.rollNumber}
                                </span>
                              )}
                              <span className="text-xs font-normal text-gray-400 truncate max-w-[180px]">
                                {student?.email || student?.user?.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <span className="font-bold text-gray-900">{student?.department}</span>
                            <span className="block text-[11px] font-semibold text-blue-700 mt-0.5">
                              {student?.yearOfStudy || (student?.graduationYear ? `${student.graduationYear} Batch` : '4th Year (E4)')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">{student?.cgpa}</td>
                          <td className="py-3.5 px-4 text-slate-800 font-semibold">
                            {student?.careerGoal?.targetRole || 'Software'}
                          </td>
                          <td className="py-3.5 px-4">
                            {app.resumeUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewResume({
                                  url: app.resumeUrl,
                                  fileName: app.resumeFileName || 'Candidate_Resume.pdf',
                                  candidateName: student?.name || 'Candidate'
                                })}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="truncate max-w-[100px]">{app.resumeFileName || 'View Resume'}</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Not provided</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                                app.status === 'SELECTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'SHORTLISTED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : app.status === 'NOT_SELECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isRecruiterPushed ? (
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Recruiter Managed</span>
                              </span>
                            ) : (
                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                              >
                                {stages.map((stg) => (
                                  <option key={stg} value={stg}>
                                    {stg.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* TPO Resume Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {previewResume.candidateName} — Verified Application Resume
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {previewResume.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={formatFileUrl(previewResume.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={formatFileUrl(previewResume.url)}
                title="Candidate Resume"
                className="w-full h-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
