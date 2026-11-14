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
  TrendingUp
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Intelligent External Job Discovery
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Separately curated from college-mandated placement drives with transparent match justification.
          </p>
        </div>

        <button
          onClick={handleRefreshRecommendations}
          disabled={refreshing}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Matching Profile...' : 'Recalculate Matches'}</span>
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-800">No Job Recommendations Generated</h2>
          <p className="text-xs text-gray-500 mt-1">
            Take assessments or refine your skills profile to trigger smart matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((rec) => {
            const job = rec.job;
            const reasons = rec.matchReasons || [];
            const skills = job.skills || [];

            return (
              <div
                key={rec.id}
                className="card bg-white hover:shadow-sm transition-all duration-200 border border-slate-200 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-blue text-xs font-semibold">{job.jobType}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {job.location}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">
                      {job.title}
                    </h2>
                    <p className="text-xs font-semibold text-blue-700 mt-0.5">
                      {job.company} • Compensation: <span className="text-gray-900 font-bold">{job.salary}</span>
                    </p>
                  </div>

                  {/* Explainable Match Indicator */}
                  <div className="flex items-center gap-4 bg-blue-50/70 p-3 rounded-xl border border-blue-100 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                        AI Compatibility
                      </span>
                      <span className="text-xs font-semibold text-gray-600">Calculated Fit</span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {rec.matchScore}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {job.description}
                </p>

                {/* Skills tags */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map((sk, i) => (
                      <span key={i} className="badge-gray text-xs">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Explainable match reasons */}
                {reasons.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 mb-4">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Transparent Suitability Justification:</span>
                    </span>
                    <ul className="space-y-1">
                      {reasons.map((rsn, idx) => (
                        <li key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rsn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <a
                    href="#apply"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Direct application redirection for ${job.title} at ${job.company}`);
                    }}
                    className="btn-primary text-xs py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <span>View Opening Details</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
