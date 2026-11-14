import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Building2, FileSpreadsheet, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function CompanyDashboard() {
  const [drives, setDrives] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyDrives() {
      try {
        const res = await api.get('/company/drives');
        setDrives(res.data || []);
      } catch (err) {
        console.error('Failed loading company drives', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyDrives();
  }, []);

  const handleViewReport = async (driveId) => {
    try {
      const res = await api.get(`/company/drives/${driveId}/feedback`);
      setSelectedReport(res.data);
    } catch (err) {
      alert('Report Notice: ' + (err.response?.data?.error || 'Report pending TPO finalization.'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Authorized Corporate Partner Interface
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review institutional recruitment specifications and access privacy-compliant aggregate candidate reports.
        </p>
      </div>

      <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Assigned Campus Recruitment Schedules
            </h2>
          </div>
          <span className="badge-green text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Corporate Recruiter</span>
          </span>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No institutional recruitment drives linked to this corporate account yet.
          </div>
        ) : (
          <div className="space-y-4">
            {drives.map((drv) => (
              <div
                key={drv.id}
                className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-blue text-xs font-semibold">{drv.workMode}</span>
                    <span className="text-xs text-gray-400">• {drv.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{drv.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hiring Role: <strong className="text-gray-800">{drv.jobRole}</strong> • CTC Package:{' '}
                    <strong className="text-blue-700">{drv.ctc}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
                    {drv._count?.applications || 0} Registered Candidates
                  </span>

                  <button
                    onClick={() => handleViewReport(drv.id)}
                    className="btn-primary text-xs py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>View Performance Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recruiter Report Modal / Inspection Area */}
      {selectedReport && (
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
            <div>
              <span className="badge-green text-xs font-semibold mb-1">Authorized Data Release</span>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                Institutional Candidate Performance Summary
              </h3>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="btn-secondary text-xs py-1 px-3 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">
                Total Applicants
              </span>
              <span className="text-2xl font-bold text-gray-900 mt-1 block">
                {selectedReport.reportData?.totalApplicants ?? 0}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">
                Shortlisted
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {selectedReport.reportData?.shortlistedCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">
                Final Selections
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {selectedReport.reportData?.selectedCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">
                Average Cohort CGPA
              </span>
              <span className="text-2xl font-bold text-gray-900 mt-1 block">
                {selectedReport.reportData?.averageCgpa ?? 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic leading-relaxed">
            Privacy Compliance Note: In accordance with student privacy protection principles, personal preparation logs, mock interview transcripts, and private skill deficit scores are redacted from recruiter visibility.
          </p>
        </div>
      )}
    </div>
  );
}
