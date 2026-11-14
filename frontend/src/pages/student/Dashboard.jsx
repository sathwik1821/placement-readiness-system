import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReadinessGauge from '../../components/ReadinessGauge';
import {
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  LineChart,
  Bot,
  Briefcase,
  Building2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading your placement profile...</p>
        </div>
      </div>
    );
  }

  const cleanScore = report?.readinessScore || 0;
  const targetRole = profile?.careerGoal?.targetRole || 'Software Developer';
  const eligibleDrives = drives.filter(d => d.isEligible);

  let parsedGaps = [];
  try {
    parsedGaps = typeof report?.skillGaps === 'string' ? JSON.parse(report.skillGaps) : (report?.skillGaps || []);
  } catch {
    parsedGaps = [];
  }

  let parsedStrengths = [];
  try {
    parsedStrengths = typeof report?.strengths === 'string' ? JSON.parse(report.strengths) : (report?.strengths || []);
  } catch {
    parsedStrengths = [];
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-3">
            Academic Year 2024–2025 • Final-Year Cohort
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {profile?.name || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Department of {profile?.department} • CGPA: <strong className="text-white font-bold">{profile?.cgpa}</strong> • Target Career Role:{' '}
            <span className="inline-block font-semibold text-emerald-400 underline decoration-dotted">
              {targetRole}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/student/tests"
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4 text-white" />
            <span>Take Assessments</span>
          </Link>
          <Link
            to="/student/interview"
            className="btn-primary bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>AI Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Gauge Card */}
        <div className="card flex flex-col items-center justify-between text-center bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <div className="w-full">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Placement Readiness Score</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">Multi-Factor Calibrated Evaluation</p>
          </div>

          <div className="my-4">
            <ReadinessGauge score={cleanScore} />
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-left">
            <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-2">
              {report?.aiFeedback || 'Take tests to unlock explainable readiness analytics.'}
            </p>
            <Link
              to="/student/analysis"
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>Explore full diagnostic breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Competency Strengths & Critical Gaps */}
        <div className="card lg:col-span-2 flex flex-col justify-between bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <LineChart className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                <span>Competency Matrix vs Industry Benchmark</span>
              </h2>
              <span className="badge-gray text-xs font-bold">{targetRole} Benchmark</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Identified Strengths</span>
                </h3>
                {parsedStrengths.length > 0 ? (
                  <div className="space-y-2">
                    {parsedStrengths.slice(0, 3).map((st, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-950">{st.skill}</span>
                        <span className="text-emerald-800 font-mono text-sm">{st.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800 font-medium">
                    Complete domain assessments to register verified strengths.
                  </p>
                )}
              </div>

              {/* Priority Skill Gaps */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4">
                <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                  <span>Prioritized Skill Gaps</span>
                </h3>
                {parsedGaps.length > 0 ? (
                  <div className="space-y-2">
                    {parsedGaps.slice(0, 3).map((gp, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-rose-950 block">{gp.skill}</span>
                          <span className="text-[11px] font-semibold text-rose-800">Observed {gp.observed}% vs Req {gp.required}%</span>
                        </div>
                        <span className="badge-red text-[10px] font-black uppercase">{gp.priority}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-800 font-medium">
                    No critical deficits flagged against target role requirements.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              AI recommendations dynamically adapt as you retake assessments.
            </span>
            <Link
              to="/student/analysis"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View Targeted Learning Paths</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Dual Columns: Recent Tests & Eligible Drives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Assessment Attempts */}
        <div className="card bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Assessment History</span>
            </h2>
            <Link to="/student/tests" className="text-xs font-bold text-blue-600 hover:underline">
              Take More →
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Assessment Records Found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Attempt foundational aptitude and CS technical tests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 4).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{att.category?.name}</h3>
                    <p className="text-xs font-medium text-slate-500">
                      Score: {att.totalScore} / {att.totalMarks} Marks
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-black font-mono ${
                        att.percentageScore >= 70
                          ? 'text-emerald-700'
                          : att.percentageScore >= 50
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {att.percentageScore}%
                    </span>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Eligible Campus Drives */}
        <div className="card bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Eligible Campus Placement Drives</span>
            </h2>
            <Link to="/student/placement" className="text-xs font-bold text-blue-600 hover:underline">
              View All Drives →
            </Link>
          </div>

          {eligibleDrives.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Published Drives Currently Match</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Check back as TPO publishes recruitment schedules.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleDrives.slice(0, 3).map((drv) => (
                <div
                  key={drv.id}
                  className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between"
                >
                  <div>
                    <span className="badge-green text-xs font-bold mb-1">ELIGIBLE TO APPLY</span>
                    <h3 className="text-xs font-black text-slate-900 mt-1">{drv.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {drv.jobRole} • CTC: <strong className="text-emerald-800 font-mono font-bold">{drv.ctc}</strong>
                    </p>
                  </div>
                  <Link
                    to="/student/placement"
                    className="btn-primary text-xs py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    View & Apply
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
