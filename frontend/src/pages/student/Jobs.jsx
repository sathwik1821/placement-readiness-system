import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Briefcase,
  MapPin,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Building,
  ArrowUpRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function Jobs() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/jobs/recommended');
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed fetching job recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefreshRecommendations = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/jobs/recommend');
      setRecommendations(res.data || []);
    } catch (err) {
      alert('Error updating recommendations: ' + (err.response?.data?.error || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  const parseJsonArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof val === 'string' ? val.split(',').map((s) => s.trim()) : [];
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI-Powered Career & Job Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Curated industry opportunities matched to your target career track, verified skills, and academic profile.
          </p>
        </div>

        <button
          onClick={handleRefreshRecommendations}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Matching Profile...' : 'Recalculate Matches'}</span>
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl text-center py-12 p-6 shadow-xs">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Job Recommendations Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete assessment suites or refine your track skills to trigger personalized opportunity matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((rec) => {
            const job = rec.job || {};
            const reasons = Array.isArray(rec.matchReasons) ? rec.matchReasons : parseJsonArray(rec.matchReasons);
            const skills = parseJsonArray(job.skills);

            return (
              <div
                key={rec.id}
                className="bg-white hover:shadow-xs transition-all border border-slate-200/90 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {job.jobType || 'FULL TIME'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location || 'Remote / Hybrid'}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 leading-snug">
                      {job.title}
                    </h2>
                    <p className="text-xs font-bold text-blue-700 mt-0.5">
                      {job.company} • Compensation:{' '}
                      <span className="text-slate-900 font-black">{job.salary}</span>
                    </p>
                  </div>

                  {/* Explainable Match Indicator */}
                  <div className="flex items-center gap-4 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                        AI Compatibility
                      </span>
                      <span className="text-xs font-medium text-slate-600">Calculated Profile Fit</span>
                    </div>
                    <div className="text-3xl font-black font-mono text-slate-900">
                      {rec.matchScore}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {job.description}
                </p>

                {/* Skills tags */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Explainable match reasons */}
                {reasons.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 mb-4">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Transparent Suitability Justification:</span>
                    </span>
                    <ul className="space-y-1">
                      {reasons.map((rsn, idx) => (
                        <li key={idx} className="text-xs text-emerald-900 font-medium flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rsn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      alert(`Direct application initiated for ${job.title} at ${job.company}! Profile package submitted.`);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Apply / View Opening Details</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
