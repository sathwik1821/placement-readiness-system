import React, { useEffect, useState } from 'react';
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
  BarChart3
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
      alert('Error updating analysis: ' + (err.response?.data?.error || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            My Placement Readiness Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Explainable AI diagnosis synthesizing assessment history, academic standing, and role expectations.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={refreshing}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Re-analyzing Gaps...' : 'Recalculate Readiness'}</span>
        </button>
      </div>

      {/* Main Readiness Metric & Qualitative Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Placement Readiness Index
          </span>
          <ReadinessGauge score={report?.readinessScore || 0} size={190} />
          <p className="text-xs text-gray-400 mt-2">
            Generated: {new Date(report?.generatedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Actionable AI Diagnostic Feedback
              </h2>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-gray-800 leading-relaxed font-medium">
              {report?.aiFeedback || 'Take tests to generate diagnostic insights.'}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-slate-700">Governance Note:</span>
            <span>
              Decision-support metric only. Does not predict deterministic placement outcomes.
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Factors & Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Strengths & Detailed Section Scores */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Sectional Competency Breakdown</span>
            </h2>
          </div>

          <div className="space-y-3.5">
            {Object.entries(breakdown).map(([key, val], idx) => {
              const sc = typeof val === 'object' ? val.score : val;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-gray-800">{key}</span>
                    <span className="font-bold text-slate-900">{sc}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        sc >= 75 ? 'bg-emerald-500' : sc >= 50 ? 'bg-blue-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, sc))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prioritized Competency Deficits vs Benchmarks */}
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <span>Prioritized Skill Gaps</span>
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deficit = Req - Obs</span>
          </div>

          {skillGaps.length === 0 ? (
            <div className="text-center py-10 text-emerald-700">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600 stroke-[2.2]" />
              <p className="text-sm font-black uppercase tracking-wider">No Priority Competency Deficits</p>
              <p className="text-xs text-slate-500 mt-1">All verified skills meet industry benchmarks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillGaps.map((gap, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{gap.skill}</h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Observed: <strong className="text-rose-700 font-mono">{gap.observed}%</strong> • Benchmark Threshold: <strong className="text-emerald-800 font-mono">{gap.required}%</strong>
                      </p>
                    </div>
                    <span
                      className={
                        gap.priority === 'HIGH'
                          ? 'badge-red text-[11px] font-black'
                          : gap.priority === 'MEDIUM'
                          ? 'badge-yellow text-[11px] font-black'
                          : 'badge-gray text-[11px] font-black'
                      }
                    >
                      {gap.priority} PRIORITY
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-rose-600 h-2.5 rounded-full"
                      style={{ width: `${gap.observed}%` }}
                    />
                    <div
                      className="absolute -top-1 bottom-0 w-1.5 h-4 bg-slate-900 rounded-sm"
                      style={{ left: `${gap.required}%` }}
                      title={`Target Benchmark: ${gap.required}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Targeted Learning Recommendations */}
      <section className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600 stroke-[2.5]" />
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Targeted Remedial Learning Curriculum
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Curated modules, tutorials, and interactive exercises strictly mapped to identified gaps.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 font-medium">No learning recommendations available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="badge-blue text-xs font-semibold">{rec.resourceType}</span>
                    <span
                      className={
                        rec.priority === 'HIGH'
                          ? 'text-rose-600 text-xs font-bold'
                          : 'text-amber-600 text-xs font-bold'
                      }
                    >
                      Remediates: {rec.skillGap}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{rec.title}</h3>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end">
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
      </section>
    </div>
  );
}
