import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReadinessGauge from '../../components/ReadinessGauge';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  ExternalLink,
  Target,
  Sparkles,
  BarChart3,
  ArrowRight,
  ClipboardCheck,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function Analysis() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    try {
      const res = await api.get('/analysis/report');
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load analysis report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRecalculate = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/analysis/generate');
      setReport(res.data);
    } catch (err) {
      alert('Error recalculating analysis: ' + (err.response?.data?.error || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Synthesizing AI placement analytics...</p>
        </div>
      </div>
    );
  }

  let breakdown = {};
  try {
    breakdown = typeof report?.readinessBreakdown === 'string'
      ? JSON.parse(report.readinessBreakdown)
      : (report?.readinessBreakdown || {});
  } catch {
    breakdown = {};
  }

  let strengths = [];
  try {
    strengths = typeof report?.strengths === 'string'
      ? JSON.parse(report.strengths)
      : (report?.strengths || []);
  } catch {
    strengths = [];
  }

  let skillGaps = [];
  try {
    skillGaps = typeof report?.skillGaps === 'string'
      ? JSON.parse(report.skillGaps)
      : (report?.skillGaps || []);
  } catch {
    skillGaps = [];
  }

  const recommendations = report?.recommendations || [];
  const targetRole = report?.targetRole || 'Java Full Stack Developer';
  const cleanScore = report?.readinessScore || 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Target Role: {targetRole}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Calibrated: {new Date(report?.generatedAt || Date.now()).toLocaleDateString()}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Detailed Placement Readiness Analysis
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Dynamic AI evaluation synthesizing your completed assessment scores against industry benchmark standards for <strong className="text-white font-bold">{targetRole}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Recalculating AI Models...' : 'Recalculate Analysis'}</span>
          </button>
          <Link
            to="/student/profile"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Change Career Role →</span>
          </Link>
        </div>
      </div>

      {/* Main Metric & AI Qualitative Diagnostic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Index */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Placement Readiness Index
          </span>
          <div className="my-2">
            <ReadinessGauge score={cleanScore} size={180} />
          </div>
          <div className="mt-2 text-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                cleanScore >= 75
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : cleanScore >= 50
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {cleanScore >= 75
                ? 'Placement Ready'
                : cleanScore >= 50
                ? 'Approaching Readiness'
                : 'Needs Remedial Focus'}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Evaluated against {targetRole} standards
            </p>
          </div>
        </div>

        {/* AI Qualitative Feedback */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Explainable AI Diagnostic Feedback
              </h2>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {report?.aiFeedback || 'Complete assessment tests to generate diagnostic insights.'}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Campus Placement Diagnostic Protocol:</span>
            <span>Synthesizes test attempts, domain benchmarks, and academic standing.</span>
          </div>
        </div>
      </div>

      {/* Primary Section: In which aspect the student is lagging (Dynamic with Career) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Identified Lagging Aspects & Competency Deficits
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified based on your actual completed assessments compared with hiring standards for <strong className="text-slate-800 font-bold">{targetRole}</strong>.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {skillGaps.length} Areas Requiring Remediation
          </span>
        </div>

        {skillGaps.length === 0 ? (
          <div className="text-center py-12 text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
            <p className="text-sm font-black uppercase tracking-wider">All Hiring Benchmarks Met!</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your verified scores in all evaluated competencies meet or exceed the hiring standards for {targetRole}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {skillGaps.map((gap, i) => {
              const isAttempted = gap.attempted !== false;
              const isCritical = gap.priority === 'CRITICAL';
              const isHigh = gap.priority === 'HIGH';

              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCritical
                      ? 'border-rose-200 bg-rose-50/30'
                      : isHigh
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        {gap.skill}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {gap.priority} PRIORITY
                      </span>
                      {!isAttempted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                          Assessment Pending
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-600">
                      {isAttempted ? (
                        <span>
                          Observed: <strong className="text-rose-700 font-mono font-bold">{gap.observed}%</strong> • Benchmark Threshold: <strong className="text-emerald-800 font-mono font-bold">{gap.required}%</strong> • Deficit: <strong className="text-rose-700 font-mono font-bold">-{gap.deficit}%</strong>
                        </span>
                      ) : (
                        <span>
                          Required Benchmark: <strong className="text-emerald-800 font-mono font-bold">{gap.required}%</strong> (Not yet attempted)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Deficit Progress Bar */}
                  <div className="relative w-full bg-slate-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isAttempted ? (gap.observed >= 50 ? 'bg-amber-500' : 'bg-rose-600') : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(4, gap.observed)}%` }}
                    />
                    <div
                      className="absolute -top-1 bottom-0 w-1.5 h-5 bg-slate-900 rounded-xs"
                      style={{ left: `${gap.required}%` }}
                      title={`Target Benchmark: ${gap.required}%`}
                    />
                  </div>

                  {/* Explainable AI Lagging Diagnosis */}
                  <div className="bg-white/90 border border-slate-200 rounded-xl p-3.5 space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-bold block mb-0.5">
                          AI Lagging Diagnosis for {targetRole}:
                        </strong>
                        {gap.laggingReason}
                      </div>
                    </div>

                    {gap.actionPlan && (
                      <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <strong className="text-blue-700 font-bold shrink-0">Action Step:</strong>
                        <span>{gap.actionPlan}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Link
                      to="/student/tests"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>{isAttempted ? 'Re-attempt Assessment to Boost Score →' : 'Take Diagnostic Test Now →'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic AI-Curated Learning Curriculum & Remedial Resources */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600 stroke-[2.5]" />
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Dynamic AI-Curated Remedial Curriculum
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative industry practice platforms, documentation, and roadmaps dynamically recommended for your lagging competencies in <strong className="text-slate-800 font-bold">{targetRole}</strong>.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 font-medium text-center">
            No pending remedial modules required.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between bg-white group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {rec.resourceType}
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      Remediates: {rec.skillGap}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {rec.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>Launch Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competency Breakdown & Strengths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sectional Competency Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Sectional Competency Breakdown</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">Target Role Weights</span>
          </div>

          <div className="space-y-4">
            {Object.entries(breakdown).map(([key, val], idx) => {
              const sc = typeof val === 'object' ? val.score : val;
              const isAttempted = typeof val === 'object' ? val.attempted : true;
              const bm = typeof val === 'object' ? val.benchmark : 70;

              return (
                <div key={idx}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-slate-800">{key}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {isAttempted ? `${sc}%` : 'Not Attempted'}
                    </span>
                  </div>
                  <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        !isAttempted
                          ? 'bg-slate-300'
                          : sc >= bm
                          ? 'bg-emerald-500'
                          : sc >= 50
                          ? 'bg-blue-600'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, sc))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Strengths */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Strengths</span>
            </h2>
            <span className="text-xs font-bold text-emerald-700">Meets / Exceeds Benchmark</span>
          </div>

          {strengths.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Verified Strengths Recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Take domain assessments to demonstrate benchmark-exceeding competencies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {strengths.map((st, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">{st.skill}</h3>
                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      Score: <strong className="font-mono">{st.score}%</strong> (Benchmark: {st.benchmark}%)
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    {st.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
