import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReadinessGauge from '../../components/ReadinessGauge';
import {
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  Bot,
  Building2,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profRes, repRes, attRes, drvRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/analysis/report').catch(() => ({ data: null })),
        api.get('/assessments/attempts').catch(() => ({ data: [] })),
        api.get('/placement/drives').catch(() => ({ data: [] }))
      ]);
      setProfile(profRes.data);
      setReport(repRes.data);
      setAttempts(attRes.data || []);
      setDrives(drvRes.data || []);
    } catch (err) {
      console.error('Failed loading student dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading your placement dashboard...</p>
        </div>
      </div>
    );
  }

  const cleanScore = report?.readinessScore || 0;
  const targetRole = profile?.careerGoal?.targetRole || report?.targetRole || 'Java Full Stack Developer';
  const eligibleDrives = drives.filter((d) => d.isEligible);

  const getScoreStatusBadge = (score) => {
    if (score >= 75) {
      return {
        label: 'Placement Ready',
        className: 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
      };
    } else if (score >= 50) {
      return {
        label: 'Approaching Readiness',
        className: 'bg-blue-500/10 text-blue-700 border-blue-300'
      };
    } else {
      return {
        label: 'Remedial Attention Needed',
        className: 'bg-amber-500/10 text-amber-700 border-amber-300'
      };
    }
  };

  const statusBadge = getScoreStatusBadge(cleanScore);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner Greeting: Welcome username, Department, followed by Career */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              {profile?.college || 'RGUKT Srikakulam'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              {profile?.yearOfStudy || '4th Year (E4)'} • {profile?.graduationYear || 2027} Batch
            </span>
            {profile?.rollNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold">
                ID: {profile.rollNumber}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Welcome, {profile?.name || 'Student'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Department of <strong className="text-white font-semibold">{profile?.department || 'Computer Science & Engineering'}</strong> • Academic CGPA: <strong className="text-white font-bold">{profile?.cgpa}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-slate-400">Target Career Goal:</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
              {targetRole}
            </span>
            <Link
              to="/student/profile"
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium ml-1"
            >
              Change Career in Profile →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/student/tests"
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xs font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-white" />
            <span>Take Tests</span>
          </Link>
          <Link
            to="/student/interview"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>AI Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Streamlined Placement Readiness Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Gauge & Score */}
          <div className="flex flex-col items-center justify-center text-center shrink-0 w-full md:w-auto">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Placement Readiness Score</span>
            </h2>
            <div className="my-2">
              <ReadinessGauge score={cleanScore} size={180} />
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* AI Qualitative Feedback & Call to Action */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Readiness Evaluation Summary</span>
              </div>
              <p className="text-xs text-slate-500">
                Calibrated dynamically for <strong className="text-slate-800 font-bold">{targetRole}</strong> benchmarks.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {report?.aiFeedback || 'Complete assessment tests to generate dynamic diagnostic insights and identify lagging aspects.'}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Detailed diagnostic breakdown highlights exact lagging aspects and remedial resources.
              </span>
              <Link
                to="/student/analysis"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <span>View Detailed Readiness Analysis & Lagging Aspects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Columns: Assessment History & Eligible Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment History Table */}
        <div className="bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Assessment History</span>
            </h2>
            <Link to="/student/tests" className="text-xs font-bold text-blue-600 hover:underline">
              Take Tests →
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Assessment Records Found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Take tests in DSA, DBMS, Aptitude, or {targetRole} to build your history.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map((att) => {
                const isPassed = att.percentageScore >= 70;
                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{att.category?.name || 'Assessment'}</h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Score: <strong className="text-slate-800">{att.totalScore} / {att.totalMarks}</strong> Marks
                        {att.completedAt && (
                          <span className="text-slate-400 text-[11px] ml-2">
                            • {new Date(att.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-base font-black font-mono ${
                          isPassed ? 'text-emerald-700' : att.percentageScore >= 50 ? 'text-blue-700' : 'text-amber-700'
                        }`}
                      >
                        {att.percentageScore}%
                      </span>
                      <span
                        className={`block text-[10px] font-bold uppercase ${
                          isPassed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isPassed ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Eligible Campus Placement Drives */}
        <div className="bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Eligible Campus Placement Drives</span>
            </h2>
            <Link to="/student/placement" className="text-xs font-bold text-blue-600 hover:underline">
              View All Drives →
            </Link>
          </div>

          {eligibleDrives.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Matching Campus Drives</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Check back as companies publish new campus recruitment opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleDrives.slice(0, 4).map((drv) => (
                <div
                  key={drv.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{drv.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Role: <strong className="text-slate-800">{drv.jobRole}</strong> • CTC:{' '}
                      <strong className="text-blue-700">{drv.ctc}</strong>
                    </p>
                  </div>
                  <Link
                    to="/student/placement"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
