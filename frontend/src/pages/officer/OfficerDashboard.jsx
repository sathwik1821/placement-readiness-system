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
  FileSpreadsheet
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
  const totalApplicants = drives.reduce((sum, d) => sum + (d._count?.applications || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Training & Placement Officer Operations Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administer institutional recruitment drives, eligibility rules, and corporate candidate reports.
          </p>
        </div>

        <Link
          to="/officer/drives/new"
          className="btn-primary bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Campus Drive</span>
        </Link>
      </div>

      {/* High-Level Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Institutional Drives
          </span>
          <span className="text-4xl font-black font-mono text-slate-900 mt-2 block">
            {totalDrives}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 inline-block">Registered Records</span>
        </div>
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Active Recruitment Windows
          </span>
          <span className="text-4xl font-black font-mono text-emerald-700 mt-2 block">
            {publishedDrives}
          </span>
          <span className="text-xs font-bold text-emerald-600 mt-1 inline-block">Open to Candidates</span>
        </div>
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Total Student Applications
          </span>
          <span className="text-4xl font-black font-mono text-slate-900 mt-2 block">
            {totalApplicants}
          </span>
          <span className="text-xs font-bold text-blue-600 mt-1 inline-block">In Evaluation Funnel</span>
        </div>
      </div>

      {/* Drives Management Table */}
      <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Institutional Campus Recruitment Drives
          </h2>
          <span className="badge-blue text-xs font-semibold">Drive Registry</span>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No recruitment drives recorded.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {drives.map((drv) => {
              const appCount = drv._count?.applications || 0;
              return (
                <div
                  key={drv.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-blue text-xs font-semibold">{drv.workMode}</span>
                      <span className="badge-green text-xs font-semibold">{drv.status}</span>
                      <span className="text-xs text-gray-400">• {drv.location}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{drv.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Role: <strong className="text-gray-800">{drv.jobRole}</strong> • Package:{' '}
                      <strong className="text-blue-700">{drv.ctc}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-gray-600 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                      {appCount} Candidates Applied
                    </span>

                    <Link
                      to={`/officer/drives/${drv.id}/applications`}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg font-semibold"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Review Pipeline</span>
                    </Link>

                    <button
                      onClick={() => handleGenerateReport(drv.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 font-semibold transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Recruiter Summary</span>
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
