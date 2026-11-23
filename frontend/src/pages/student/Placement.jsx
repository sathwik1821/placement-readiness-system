import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function Placement() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [activeTab, setActiveTab] = useState('DRIVES'); // DRIVES | APPLICATIONS

  const loadPlacementData = async () => {
    try {
      const [drvRes, appRes] = await Promise.all([
        api.get('/placement/drives'),
        api.get('/placement/applications')
      ]);
      setDrives(drvRes.data || []);
      setApplications(appRes.data || []);
    } catch (err) {
      console.error('Failed loading placement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacementData();
  }, []);

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    try {
      await api.post(`/placement/drives/${driveId}/apply`);
      alert('Application successfully submitted for official campus recruitment drive!');
      await loadPlacementData();
    } catch (err) {
      alert('Application failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setApplyingId(null);
    }
  };

  const isAlreadyApplied = (driveId) => {
    return applications.some((app) => app.driveId === driveId);
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
          Official Institutional Campus Placement Drives
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Authorized recruitment drives governed by the college Training & Placement Cell (TPO).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('DRIVES')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'DRIVES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming Campus Drives ({drives.length})
        </button>
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'APPLICATIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Applications Tracker ({applications.length})
        </button>
      </div>

      {/* Active Tab: Upcoming Campus Drives */}
      {activeTab === 'DRIVES' && (
        <div className="space-y-4">
          {drives.length === 0 ? (
            <div className="card text-center py-12">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No Active Drives Published</p>
              <p className="text-xs text-gray-400 mt-1">The Placement Officer will publish notices soon.</p>
            </div>
          ) : (
            drives.map((drive) => {
              const applied = isAlreadyApplied(drive.id);
              const isApplying = applyingId === drive.id;
              const crit = drive.eligibilityCriteria || {};

              return (
                <div
                  key={drive.id}
                  className="card bg-white hover:shadow-sm transition-all duration-200 border border-slate-200 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge-blue text-xs font-semibold">{drive.workMode}</span>
                        {drive.isEligible ? (
                          <span className="badge-green text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Meets Institutional Cutoffs</span>
                          </span>
                        ) : (
                          <span className="badge-red text-xs font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Academic Cutoff Ineligible</span>
                          </span>
                        )}
                        <span className="text-xs text-gray-400">• {drive.location}</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">{drive.title}</h2>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">
                        Role: {drive.jobRole} • Package CTC: <strong className="text-gray-900">{drive.ctc}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {applied ? (
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Application Submitted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(drive.id)}
                          disabled={!drive.isEligible || isApplying}
                          className="btn-primary bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold py-2.5 px-5 flex items-center gap-1.5 rounded-xl shadow-sm transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isApplying ? 'Processing Application...' : 'One-Click Apply'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {drive.jobDescription}
                  </p>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span className="font-bold text-gray-700">Eligibility Gates:</span>
                    <span>Min CGPA: <strong>{crit.minCgpa || 'No Cutoff'}</strong></span>
                    <span>Max Backlogs: <strong>{crit.maxBacklogs ?? 'Any'}</strong></span>
                    {crit.departments && (
                      <span>Allowed Branches: <strong>{crit.departments.join(', ')}</strong></span>
                    )}
                    {(crit.allowedYears || crit.allowedGradYears || crit.graduationYear) && (
                      <span>Allowed Batches: <strong className="text-blue-700">
                        {crit.allowedYears ? crit.allowedYears.map((y) => `${y}th Year (E${y})`).join(', ') : ''}
                        {crit.graduationYear ? ` (${crit.graduationYear} Batch)` : ''}
                      </strong></span>
                    )}
                    {drive.deadline && (
                      <span className="ml-auto text-rose-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(drive.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active Tab: Multi-Stage Applications Tracker */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="card text-center py-12">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No Active Applications</p>
              <p className="text-xs text-gray-400 mt-1">Review upcoming drives above and submit applications.</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <h2 className="text-base font-bold text-gray-900">{app.drive?.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{app.drive?.jobRole}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : app.status === 'NOT_SELECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Stage: {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress bar of recruitment stages */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    Multi-Stage Pipeline Lifecycle:
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-[11px]">
                    {[
                      'APPLIED',
                      'ASSESSMENT_PENDING',
                      'ASSESSMENT_COMPLETED',
                      'SHORTLISTED',
                      'SELECTED'
                    ].map((stg, i) => {
                      const isReached = app.status === stg || (stg === 'APPLIED');
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border font-semibold ${
                            app.status === stg
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : isReached
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {stg.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
