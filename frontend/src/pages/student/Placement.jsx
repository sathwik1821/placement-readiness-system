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
  Send,
  FileText,
  Upload,
  ExternalLink,
  X,
  FileCheck,
  Check,
  User
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function formatFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Placement() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DRIVES'); // DRIVES | APPLICATIONS

  // Apply Modal State
  const [applyModalDrive, setApplyModalDrive] = useState(null);
  const [resumeChoice, setResumeChoice] = useState('PROFILE'); // PROFILE | UPLOAD | LINK
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedResumeInfo, setUploadedResumeInfo] = useState(null);
  const [externalResumeLink, setExternalResumeLink] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Resume Preview Modal State
  const [previewResume, setPreviewResume] = useState(null);

  const loadPlacementData = async () => {
    try {
      const [drvRes, appRes, profRes] = await Promise.all([
        api.get('/placement/drives'),
        api.get('/placement/applications'),
        api.get('/students/profile').catch(() => ({ data: null }))
      ]);
      setDrives(drvRes.data || []);
      setApplications(appRes.data || []);
      if (profRes.data) {
        setStudentProfile(profRes.data);
      }
    } catch (err) {
      console.error('Failed loading placement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacementData();
  }, []);

  const handleOpenApplyModal = (drive) => {
    setApplyModalDrive(drive);
    setApplyError('');
    setSelectedFile(null);
    setUploadedResumeInfo(null);
    setExternalResumeLink('');

    if (studentProfile?.resumeUrl) {
      setResumeChoice('PROFILE');
    } else {
      setResumeChoice('UPLOAD');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setApplyError('File exceeds 15MB limit. Please upload a smaller document.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setApplyError('Only PDF and Word (.docx, .doc) files are supported.');
      return;
    }

    setSelectedFile(file);
    setApplyError('');
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/placement/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadedResumeInfo(res.data);
      // Update local profile state
      setStudentProfile((prev) => prev ? {
        ...prev,
        resumeUrl: res.data.resumeUrl,
        resumeFileName: res.data.resumeFileName
      } : prev);
    } catch (err) {
      setApplyError('Upload failed: ' + (err.response?.data?.error || err.message));
      setSelectedFile(null);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleConfirmApplication = async () => {
    if (!applyModalDrive) return;

    let resumeUrl = '';
    let resumeFileName = '';

    if (resumeChoice === 'PROFILE') {
      resumeUrl = studentProfile?.resumeUrl || '';
      resumeFileName = studentProfile?.resumeFileName || 'Profile_Resume.pdf';
    } else if (resumeChoice === 'UPLOAD') {
      if (!uploadedResumeInfo) {
        setApplyError('Please upload your resume file (PDF/DOCX) before submitting.');
        return;
      }
      resumeUrl = uploadedResumeInfo.resumeUrl;
      resumeFileName = uploadedResumeInfo.resumeFileName;
    } else if (resumeChoice === 'LINK') {
      if (!externalResumeLink.trim()) {
        setApplyError('Please enter a valid link to your hosted resume (e.g. Google Drive, Portfolio).');
        return;
      }
      resumeUrl = externalResumeLink.trim();
      resumeFileName = 'External_Resume_Link';
    }

    setSubmittingApp(true);
    setApplyError('');

    try {
      await api.post(`/placement/drives/${applyModalDrive.id}/apply`, {
        resumeUrl,
        resumeFileName
      });

      alert(`Application successfully submitted with resume for ${applyModalDrive.title}!`);
      setApplyModalDrive(null);
      await loadPlacementData();
    } catch (err) {
      setApplyError(err.response?.data?.error || err.message || 'Application submission failed.');
    } finally {
      setSubmittingApp(false);
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
              const crit = drive.eligibilityCriteria || {};
              const isExpired = drive.deadline && new Date() > new Date(drive.deadline);
              const diffDays = drive.deadline ? Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <div
                  key={drive.id}
                  className="card bg-white hover:shadow-sm transition-all duration-200 border border-slate-200 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
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

                        {/* Prominent Deadline Pill */}
                        {drive.deadline && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                              isExpired
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : diffDays <= 2
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {isExpired
                                ? 'Deadline Passed'
                                : diffDays === 0
                                ? 'Last Date: Today'
                                : diffDays === 1
                                ? 'Last Date: Tomorrow'
                                : `Last Date: ${new Date(drive.deadline).toLocaleDateString()}`}
                            </span>
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
                      ) : isExpired ? (
                        <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline Passed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(drive)}
                          disabled={!drive.isEligible}
                          className="btn-primary bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold py-2.5 px-5 flex items-center gap-1.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply with Resume</span>
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
                      <span className={`ml-auto font-bold flex items-center gap-1 ${isExpired ? 'text-rose-600' : 'text-blue-700'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Last Date to Apply: <strong>{new Date(drive.deadline).toLocaleDateString()}</strong>
                          {!isExpired && diffDays !== null && (
                            <span className="text-slate-500 font-medium ml-1">
                              ({diffDays === 0 ? 'Closes today' : `${diffDays} days left`})
                            </span>
                          )}
                        </span>
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
              <div key={app.id} className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <h2 className="text-base font-bold text-gray-900">{app.drive?.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{app.drive?.jobRole}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* View Submitted Resume Button */}
                    {app.resumeUrl ? (
                      <button
                        onClick={() => setPreviewResume({
                          url: app.resumeUrl,
                          fileName: app.resumeFileName || 'Candidate_Resume.pdf',
                          title: app.drive?.title || 'Placement Application'
                        })}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Submitted Resume ({app.resumeFileName || 'Resume.pdf'})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No resume attached</span>
                    )}

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
                <div className="pt-1">
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

      {/* Apply With Resume Modal */}
      {applyModalDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-blue text-xs font-bold uppercase">
                  {applyModalDrive.workMode} • Campus Drive
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {applyModalDrive.title}
                </h3>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">
                  Role: {applyModalDrive.jobRole} • Package: {applyModalDrive.ctc}
                </p>
              </div>
              <button
                onClick={() => setApplyModalDrive(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Student Quick Dossier */}
            {studentProfile && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{studentProfile.name}</span>
                  <span className="text-slate-500 text-[11px] font-mono">{studentProfile.rollNumber} • {studentProfile.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic CGPA</span>
                  <span className="font-mono font-bold text-slate-900">{studentProfile.cgpa}</span>
                </div>
              </div>
            )}

            {/* Resume Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Attach Resume Document (Viewable by Recruiter & TPO)
              </label>

              {/* Option 1: Saved Profile Resume */}
              {studentProfile?.resumeUrl && (
                <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  resumeChoice === 'PROFILE'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resumeChoice"
                      value="PROFILE"
                      checked={resumeChoice === 'PROFILE'}
                      onChange={() => setResumeChoice('PROFILE')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Saved Profile Resume</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[240px]">
                        {studentProfile.resumeFileName || 'Profile_Resume.pdf'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewResume({
                        url: studentProfile.resumeUrl,
                        fileName: studentProfile.resumeFileName || 'Profile_Resume.pdf',
                        title: 'Saved Profile Resume'
                      });
                    }}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </label>
              )}

              {/* Option 2: Upload New Document */}
              <label className={`p-3.5 rounded-xl border flex flex-col gap-2.5 cursor-pointer transition-all ${
                resumeChoice === 'UPLOAD'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="resumeChoice"
                    value="UPLOAD"
                    checked={resumeChoice === 'UPLOAD'}
                    onChange={() => setResumeChoice('UPLOAD')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Upload New Resume Document (PDF / DOCX)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard format up to 15MB
                    </span>
                  </div>
                </div>

                {resumeChoice === 'UPLOAD' && (
                  <div className="pt-2 pl-7 space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      disabled={uploadingResume}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-slate-600"
                    />

                    {uploadingResume && (
                      <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5 animate-pulse">
                        <Upload className="w-3.5 h-3.5 animate-bounce" />
                        <span>Uploading & encrypting resume document...</span>
                      </div>
                    )}

                    {uploadedResumeInfo && (
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[200px]">{uploadedResumeInfo.resumeFileName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {Math.round(uploadedResumeInfo.fileSize / 1024)} KB
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </label>

              {/* Option 3: External Hosted Link */}
              <label className={`p-3.5 rounded-xl border flex flex-col gap-2.5 cursor-pointer transition-all ${
                resumeChoice === 'LINK'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="resumeChoice"
                    value="LINK"
                    checked={resumeChoice === 'LINK'}
                    onChange={() => setResumeChoice('LINK')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Hosted Cloud Link (Google Drive / Portfolio)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Ensure link is set to "Anyone with the link can view"
                    </span>
                  </div>
                </div>

                {resumeChoice === 'LINK' && (
                  <div className="pt-1 pl-7">
                    <input
                      type="url"
                      value={externalResumeLink}
                      onChange={(e) => setExternalResumeLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or portfolio link"
                      className="input text-xs font-medium py-1.5"
                    />
                  </div>
                )}
              </label>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyModalDrive(null)}
                disabled={submittingApp}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApplication}
                disabled={submittingApp || uploadingResume}
                className="btn-primary text-xs py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingApp ? 'Submitting Application...' : 'Confirm & Apply'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Resume Preview Modal */}
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
                    {previewResume.fileName || 'Candidate Resume'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {previewResume.title || 'Official Application Document'}
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
                title="Resume Preview"
                className="w-full h-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
