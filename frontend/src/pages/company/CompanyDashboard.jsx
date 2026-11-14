import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Users,
  Plus,
  Send,
  X,
  UserCheck,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function CompanyDashboard() {
  const [drives, setDrives] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDriveApplicants, setSelectedDriveApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Drive Requisition Form State
  const [newDrive, setNewDrive] = useState({
    title: '',
    jobRole: '',
    ctc: '',
    workMode: 'ONSITE',
    location: '',
    minCgpa: '7.5',
    maxBacklogs: '0',
    departments: 'Computer Science, Information Science',
    jobDescription: ''
  });

  const fetchCompanyDrives = async () => {
    try {
      const res = await api.get('/company/drives');
      setDrives(res.data || []);
    } catch (err) {
      console.error('Failed loading company drives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDrives();
  }, []);

  const handleOpenApplicants = async (drive) => {
    setSelectedDriveApplicants(drive);
    setApplicantsLoading(true);
    try {
      const res = await api.get(`/company/drives/${drive.id}/applications`);
      setApplicantsList(res.data || []);
    } catch (err) {
      alert('Failed loading candidates: ' + (err.response?.data?.error || err.message));
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/company/drives/${selectedDriveApplicants.id}/applications/${appId}/status`, {
        status: newStatus
      });
      setApplicantsList((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: newDrive.title,
        jobRole: newDrive.jobRole,
        ctc: newDrive.ctc,
        workMode: newDrive.workMode,
        location: newDrive.location,
        jobDescription: newDrive.jobDescription,
        status: 'PENDING_TPO_APPROVAL',
        eligibilityCriteria: {
          minCgpa: parseFloat(newDrive.minCgpa) || 7.0,
          maxBacklogs: parseInt(newDrive.maxBacklogs) || 0,
          departments: newDrive.departments.split(',').map((d) => d.trim())
        }
      };

      await api.post('/company/drives', payload);
      setIsModalOpen(false);
      setNewDrive({
        title: '',
        jobRole: '',
        ctc: '',
        workMode: 'ONSITE',
        location: '',
        minCgpa: '7.5',
        maxBacklogs: '0',
        departments: 'Computer Science, Information Science',
        jobDescription: ''
      });
      fetchCompanyDrives();
      alert('Hiring requisition submitted to TPO! The drive is now in PENDING TPO REVIEW status and will be published to students upon TPO approval.');
    } catch (err) {
      alert('Requisition submission error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReport = async (driveId) => {
    try {
      const res = await api.get(`/company/drives/${driveId}/feedback`);
      setSelectedReport(res.data);
    } catch (err) {
      alert('Report Notice: ' + (err.response?.data?.error || 'Aggregate report pending TPO finalization.'));
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
    <div className="space-y-8 font-sans">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Corporate Partner Talent Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Submit new campus hiring requisitions directly to the institution, track drive registrations, and evaluate candidate pipelines.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Submit Hiring Requisition (JAF)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Active Placement Drives
          </span>
          <span className="text-3xl font-black text-slate-900 mt-2 block font-mono">
            {drives.length}
          </span>
          <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">
            Published & Operating
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Total Candidate Pipeline
          </span>
          <span className="text-3xl font-black text-slate-900 mt-2 block font-mono">
            {drives.reduce((sum, d) => sum + (d._count?.applications || 0), 0)}
          </span>
          <span className="text-xs text-emerald-700 font-semibold mt-1 inline-block">
            Verified Student Applicants
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Partnership Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-black text-slate-900">
              Verified Corporate Recruiter
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
            Direct TPO Link Active
          </span>
        </div>
      </div>

      {/* Main Drive List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-600 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900">
              Assigned Campus Recruitment Schedules
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {drives.length} Records
          </span>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No institutional recruitment drives linked to this corporate account yet. Click "Submit Hiring Requisition" above to post your first campus drive.
          </div>
        ) : (
          <div className="space-y-4">
            {drives.map((drv) => (
              <div
                key={drv.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {drv.workMode}
                    </span>
                    {drv.status === 'PENDING_TPO_APPROVAL' && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        Pending TPO Review
                      </span>
                    )}
                    {drv.status === 'PUBLISHED' && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        Published
                      </span>
                    )}
                    {drv.status === 'ON_HOLD' && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        On Hold
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">• {drv.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{drv.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Target Role: <strong className="text-slate-900">{drv.jobRole}</strong> • CTC Package:{' '}
                    <strong className="text-blue-700 font-bold">{drv.ctc}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleOpenApplicants(drv)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Review Applicants ({drv._count?.applications || 0})</span>
                  </button>

                  <button
                    onClick={() => handleViewReport(drv.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cohort Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Pipeline Drawer / Modal */}
      {selectedDriveApplicants && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Candidate Pipeline
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDriveApplicants.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Role: <strong className="text-slate-800">{selectedDriveApplicants.jobRole}</strong> • Package: <strong className="text-blue-700">{selectedDriveApplicants.ctc}</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedDriveApplicants(null)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              Close Pipeline
            </button>
          </div>

          {applicantsLoading ? (
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
                    <th className="pb-3">Hiring Stage</th>
                    <th className="pb-3 pr-2 text-right">Recruiter Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicantsList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">
                        {app.student?.name || 'Candidate #' + app.studentId?.slice(0, 6)}
                        <span className="block text-xs font-normal text-slate-500">
                          {app.student?.user?.email || 'Registered Student'}
                        </span>
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
                              onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                              className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'SELECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
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
      )}

      {/* Recruiter Report Inspection Area */}
      {selectedReport && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1">
                Authorized Performance Summary
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Drive Recruitment Cohort Metrics
              </h3>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                Total Applicants
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {selectedReport.reportData?.totalApplicants ?? 0}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                Shortlisted
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {selectedReport.reportData?.shortlistedCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                Final Selections
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">
                {selectedReport.reportData?.selectedCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                Average Cohort CGPA
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {selectedReport.reportData?.averageCgpa ?? 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Privacy Compliance Note: In accordance with student privacy protection principles, personal practice transcripts and private diagnostic deficit scores are redacted from external partner visibility.
          </p>
        </div>
      )}

      {/* Modal: Submit New Hiring Requisition (JAF) */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Eligible Branches
                    </label>
                    <input
                      type="text"
                      value={newDrive.departments}
                      onChange={(e) => setNewDrive({ ...newDrive, departments: e.target.value })}
                      placeholder="CS, IS, EC"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                    />
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Requisition...' : 'Publish Drive Requisition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
