import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import CompanyRequisitionModal from './components/CompanyRequisitionModal';
import CompanyApplicantsDrawer from './components/CompanyApplicantsDrawer';
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
  Filter,
  FileText,
  ExternalLink
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function formatFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function CompanyDashboard() {
  const [drives, setDrives] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDriveApplicants, setSelectedDriveApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState(null);

  // New Drive Requisition Form State
  const [newDrive, setNewDrive] = useState({
    title: '',
    jobRole: '',
    ctc: '',
    workMode: 'ONSITE',
    location: '',
    deadline: '',
    minCgpa: '7.5',
    maxBacklogs: '0',
    targetBatch: 'ALL',
    departments: 'CSE, ECE, ME, CE, CHE, MME',
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
      let allowedYears = [4, 3];
      let allowedGradYears = [2027, 2028];
      if (newDrive.targetBatch === '2027') {
        allowedYears = [4];
        allowedGradYears = [2027];
      } else if (newDrive.targetBatch === '2028') {
        allowedYears = [3];
        allowedGradYears = [2028];
      }

      const payload = {
        title: newDrive.title,
        jobRole: newDrive.jobRole,
        ctc: newDrive.ctc,
        workMode: newDrive.workMode,
        location: newDrive.location,
        deadline: newDrive.deadline || null,
        jobDescription: newDrive.jobDescription,
        status: 'PENDING_TPO_APPROVAL',
        eligibilityCriteria: {
          minCgpa: parseFloat(newDrive.minCgpa) || 7.0,
          maxBacklogs: parseInt(newDrive.maxBacklogs) || 0,
          departments: newDrive.departments.split(',').map((d) => d.trim()),
          allowedYears,
          allowedGradYears
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
        deadline: '',
        minCgpa: '7.5',
        maxBacklogs: '0',
        targetBatch: 'ALL',
        departments: 'CSE, ECE, ME, CE, CHE, MME',
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
                  {drv.deadline && (() => {
                    const isExpired = new Date() > new Date(drv.deadline);
                    return (
                      <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Date to Apply: <strong className={isExpired ? 'text-rose-600' : 'text-slate-800'}>{new Date(drv.deadline).toLocaleDateString()}</strong></span>
                        {isExpired && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded ml-1">
                            Application Window Closed
                          </span>
                        )}
                      </p>
                    );
                  })()}
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
      <CompanyApplicantsDrawer
        drive={selectedDriveApplicants}
        applicantsList={applicantsList}
        loading={applicantsLoading}
        onClose={() => setSelectedDriveApplicants(null)}
        onUpdateStatus={handleUpdateStatus}
        onPreviewResume={setPreviewResume}
      />

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
      <CompanyRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newDrive={newDrive}
        setNewDrive={setNewDrive}
        onSubmit={handleCreateRequisition}
        submitting={submitting}
      />

      {/* Recruiter Resume Preview Modal */}
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
                    {previewResume.candidateName} — Verified Resume
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
