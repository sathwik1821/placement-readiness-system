import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Check,
  Pause,
  AlertCircle
} from 'lucide-react';

export default function OfficerDashboard() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/officer/drives');
      setDrives(res.data || []);
    } catch (err) {
      console.error('Failed fetching officer drives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleDriveStatusChange = async (driveId, newStatus) => {
    try {
      await api.put(`/officer/drives/${driveId}/status`, { status: newStatus });
      setDrives((prev) =>
        prev.map((d) => (d.id === driveId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      alert('Failed updating drive status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGenerateReport = async (driveId) => {
    try {
      const res = await api.post(`/officer/drives/${driveId}/feedback-report`);
      alert(`Aggregate Recruiter Performance Summary Generated!\nTotal Applicants: ${res.data.data.totalApplicants}\nShortlisted Candidates: ${res.data.data.shortlistedCount}\nSelected: ${res.data.data.selectedCount}`);
    } catch (err) {
      alert('Error generating feedback report: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalDrives = drives.length;
  const publishedDrives = drives.filter((d) => d.status === 'PUBLISHED').length;
  const pendingDrives = drives.filter((d) => d.status === 'PENDING_TPO_APPROVAL').length;
  const totalApplicants = drives.reduce((sum, d) => sum + (d._count?.applications || 0), 0);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Training & Placement Officer Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Administer institutional recruitment drives, review and approve corporate requisitions, and monitor candidate funnels.
          </p>
        </div>

        <Link
          to="/officer/drives/new"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Publish New Campus Drive</span>
        </Link>
      </div>

      {/* High-Level Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Drives
          </span>
          <span className="text-3xl font-black font-mono text-slate-900 mt-2 block">
            {totalDrives}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">Registered Records</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Live Windows
          </span>
          <span className="text-3xl font-black font-mono text-emerald-700 mt-2 block">
            {publishedDrives}
          </span>
          <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">Published to Students</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending TPO Review
          </span>
          <span className="text-3xl font-black font-mono text-amber-700 mt-2 block">
            {pendingDrives}
          </span>
          <span className="text-xs font-semibold text-amber-600 mt-1 inline-block">Awaiting Approval</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Student Applications
          </span>
          <span className="text-3xl font-black font-mono text-blue-700 mt-2 block">
            {totalApplicants}
          </span>
          <span className="text-xs font-semibold text-blue-600 mt-1 inline-block">In Evaluation Funnel</span>
        </div>
      </div>

      {/* Drives Management Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Institutional Campus Recruitment Drives
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review corporate requisitions and publish or hold drives for candidate applications.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {drives.length} Drives
          </span>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No recruitment drives recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {drives.map((drv) => {
              const appCount = drv._count?.applications || 0;
              const isPending = drv.status === 'PENDING_TPO_APPROVAL';
              const isPublished = drv.status === 'PUBLISHED';
              const isOnHold = drv.status === 'ON_HOLD';

              return (
                <div
                  key={drv.id}
                  className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {drv.workMode}
                      </span>

                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Pending TPO Review</span>
                        </span>
                      )}

                      {isPublished && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Published</span>
                        </span>
                      )}

                      {isOnHold && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          On Hold
                        </span>
                      )}

                      <span className="text-xs text-slate-500 font-medium">• {drv.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{drv.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Role: <strong className="text-slate-800">{drv.jobRole}</strong> • Package:{' '}
                      <strong className="text-blue-700 font-bold">{drv.ctc}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {/* TPO Approval / Publish Controls */}
                    {isPending ? (
                      <div className="flex items-center gap-2 bg-amber-50/80 p-1.5 rounded-xl border border-amber-200">
                        <button
                          onClick={() => handleDriveStatusChange(drv.id, 'PUBLISHED')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                        <button
                          onClick={() => handleDriveStatusChange(drv.id, 'ON_HOLD')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Hold</span>
                        </button>
                      </div>
                    ) : isPublished ? (
                      <button
                        onClick={() => handleDriveStatusChange(drv.id, 'ON_HOLD')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Hold Drive</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDriveStatusChange(drv.id, 'PUBLISHED')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish to Students</span>
                      </button>
                    )}

                    <span className="text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      {appCount} Candidates
                    </span>

                    <Link
                      to={`/officer/drives/${drv.id}/applications`}
                      className="text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Pipeline</span>
                    </Link>

                    <button
                      onClick={() => handleGenerateReport(drv.id)}
                      className="text-xs py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
