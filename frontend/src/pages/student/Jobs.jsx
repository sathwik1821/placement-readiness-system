import React, { useEffect, useState, useCallback } from 'react';
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
  DollarSign,
  Search,
  Filter,
  X,
  Check,
  Cpu,
  Layers,
  Send,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  { value: '', label: 'All 4 Career Domains' },
  { value: 'Java Full Stack Developer', label: 'Java Full Stack' },
  { value: 'MERN Full Stack Developer', label: 'MERN Full Stack' },
  { value: 'AI / ML Engineer', label: 'AI & Machine Learning' },
  { value: 'Data Analyst', label: 'Data Analytics & BI' }
];

export default function Jobs() {
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [sortBy, setSortBy] = useState('FIT');

  // Student Context
  const [studentProfile, setStudentProfile] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('applied_external_jobs') || '[]');
    } catch {
      return [];
    }
  });

  // Modal State
  const [detailJob, setDetailJob] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');

  // Fetch student profile & initial jobs
  useEffect(() => {
    async function init() {
      try {
        const profRes = await api.get('/students/profile').catch(() => ({ data: null }));
        if (profRes.data) {
          setStudentProfile(profRes.data);
          if (profRes.data.careerGoal?.targetRole) {
            setSelectedDomain(profRes.data.careerGoal.targetRole);
          }
        }
      } catch (err) {
        console.error('Failed fetching profile context', err);
      }
    }
    init();
  }, []);

  const executeSearch = useCallback(async (params = {}) => {
    setSearching(true);
    try {
      const q = params.query !== undefined ? params.query : searchQuery;
      const dom = params.domain !== undefined ? params.domain : selectedDomain;
      const type = params.jobType !== undefined ? params.jobType : selectedJobType;
      const mode = params.workMode !== undefined ? params.workMode : selectedWorkMode;
      const sort = params.sortBy !== undefined ? params.sortBy : sortBy;
      const live = params.live || false;

      const res = await api.get('/jobs/search', {
        params: {
          q,
          domain: dom,
          jobType: type,
          workMode: mode,
          sortBy: sort,
          live
        }
      });

      setJobsList(res.data || []);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, [searchQuery, selectedDomain, selectedJobType, selectedWorkMode, sortBy]);

  // Initial load
  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedDomain('');
    setSelectedJobType('ALL');
    setSelectedWorkMode('ALL');
    setSortBy('FIT');
    executeSearch({ query: '', domain: '', jobType: 'ALL', workMode: 'ALL', sortBy: 'FIT' });
  };

  const handleAiLiveDiscovery = async (queryText = '') => {
    const prompt = queryText || customAiPrompt || searchQuery || 'Cloud Systems Engineer';
    setDiscovering(true);
    try {
      const res = await api.post('/jobs/ai-discover', {
        query: prompt,
        domain: selectedDomain || 'Software Engineering',
        location: 'Bengaluru / Hyderabad'
      });
      setJobsList(res.data || []);
      setShowAiModal(false);
      setCustomAiPrompt('');
    } catch (err) {
      alert('AI discovery note: ' + (err.response?.data?.error || err.message));
    } finally {
      setDiscovering(false);
    }
  };

  const handleApplyJob = (job) => {
    const updated = [...appliedJobs, job.id];
    setAppliedJobs(updated);
    try {
      localStorage.setItem('applied_external_jobs', JSON.stringify(updated));
    } catch (ignored) {}
    alert(`Application submitted successfully for ${job.title} at ${job.company}! Your profile dossier has been forwarded.`);
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

  const quickPillSearches = [
    'Spring Boot & Java',
    'React & Node.js',
    'Machine Learning & Python',
    'Data Analyst & SQL',
    'Remote Only',
    'Internship'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 text-blue-700 border border-blue-200 text-xs font-black shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Dynamic AI Talent Opportunity Engine</span>
            </span>
            {studentProfile?.careerGoal?.targetRole && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Track: {studentProfile.careerGoal.targetRole}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dynamic Opportunity Search & AI Recommendation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Search live tech openings across companies, technologies, and roles. The engine computes transparent compatibility scores based on your target role, verified skills, and assessment metrics.
          </p>
        </div>

        {/* Live AI Market Discovery Button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Discover with AI</span>
        </button>
      </div>

      {/* Dynamic Search & Filter Control Bar */}
      <div className="card bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Main Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, technology, company, or keywords (e.g., Spring Boot, React, AWS, Python, Uber)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{searching ? 'Searching...' : 'Search Opportunities'}</span>
          </button>
        </form>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Domain Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Career Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Position Type
            </label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          {/* Work Mode Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Work Location Mode
            </label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="FIT">Highest Profile Match %</option>
              <option value="RECENT">Most Recently Posted</option>
              <option value="SALARY">Highest Compensation CTC</option>
            </select>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Popular Queries:</span>
          </span>
          {quickPillSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag === 'Remote Only') {
                  setSelectedWorkMode('REMOTE');
                  executeSearch({ workMode: 'REMOTE' });
                } else if (tag === 'Internship') {
                  setSelectedJobType('INTERNSHIP');
                  executeSearch({ jobType: 'INTERNSHIP' });
                } else {
                  setSearchQuery(tag);
                  executeSearch({ query: tag });
                }
              }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            >
              {tag}
            </button>
          ))}
          {(searchQuery || selectedDomain || selectedJobType !== 'ALL' || selectedWorkMode !== 'ALL') && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-[11px] font-bold text-rose-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
        <span>
          Showing <strong className="text-slate-900">{jobsList.length}</strong> dynamic opportunities
          {searchQuery ? ` matching "${searchQuery}"` : ' calibrated to your profile'}
        </span>
        <button
          onClick={() => executeSearch({ live: true })}
          disabled={searching}
          className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
          <span>Refresh Live Matches</span>
        </button>
      </div>

      {/* Job Listings Grid */}
      {jobsList.length === 0 ? (
        <div className="card bg-white border border-slate-200/90 rounded-2xl text-center py-16 p-6 shadow-sm space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">
            No Openings Found Matching Your Filter
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or trigger live AI market discovery to generate requisitions for this niche.
          </p>
          <button
            onClick={() => handleAiLiveDiscovery()}
            disabled={discovering}
            className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl inline-flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{discovering ? 'Discovering Market Requisitions with AI...' : 'Discover with AI'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {jobsList.map((item) => {
            const job = item.job || {};
            const matchScore = item.matchScore ?? 75;
            const reasons = item.matchReasons || [];
            const matchedSkills = item.matchedSkills || [];
            const allSkills = parseJsonArray(job.skills);
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="card bg-white hover:shadow-md transition-all border border-slate-200 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="badge-blue text-xs font-bold uppercase">
                        {job.jobType || 'FULL TIME'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        job.workMode === 'REMOTE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {job.workMode || 'HYBRID'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location || 'Bengaluru / Hybrid'}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 leading-snug">
                      {job.title}
                    </h2>
                    <p className="text-xs font-bold text-blue-700 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                      <span className="text-slate-300">•</span>
                      <span>Compensation: <strong className="text-slate-900">{job.salary}</strong></span>
                    </p>
                  </div>

                  {/* AI Compatibility Fit Badge */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3 rounded-xl border border-blue-200 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                        AI Profile Fit
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {matchScore >= 85 ? 'Strong Match' : matchScore >= 75 ? 'Solid Fit' : 'Potential Fit'}
                      </span>
                    </div>
                    <div className="text-3xl font-black font-mono text-slate-900">
                      {matchScore}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills Breakdown */}
                {allSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Technical Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkills.map((sk, i) => {
                        const isMatched = matchedSkills.some(
                          (ms) => ms.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(ms.toLowerCase())
                        );
                        return (
                          <span
                            key={i}
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 border ${
                              isMatched
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isMatched && <Check className="w-3 h-3 text-emerald-600" />}
                            <span>{sk}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Transparent Match Reasons */}
                {reasons.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <span className="font-black text-slate-900 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Transparent Profile Compatibility Justification:</span>
                    </span>
                    <ul className="space-y-1 text-slate-700 text-xs">
                      {reasons.map((rsn, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rsn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setDetailJob(job)}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>View Requirements & Responsibilities</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isApplied ? (
                      <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Application Submitted</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyJob(job)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Express Interest / Direct Apply</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Live Discovery Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Live Market Requisition Discovery
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Powered by Enterprise AI Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Looking for a specific emerging technology or niche role not listed above? Tell the AI what tech stack, company tier, or engineering domain you are targeting:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Target Role Query
              </label>
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="e.g. Distributed Golang Systems Engineer, LLM Fine-tuning, AWS Kubernetes DevOps..."
                className="input text-xs font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 block w-full">Quick suggestions:</span>
              {['Golang Microservices', 'Kubernetes DevOps SRE', 'LLM Prompt Engineering', 'Full Stack React & Java'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCustomAiPrompt(s)}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAiLiveDiscovery()}
                disabled={discovering}
                className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{discovering ? 'Generating Requisitions...' : 'Generate Openings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Job Requirements Modal */}
      {detailJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-blue text-xs font-bold uppercase">{detailJob.jobType}</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{detailJob.title}</h3>
                <p className="text-xs font-bold text-blue-700 mt-0.5">
                  {detailJob.company} • {detailJob.location}
                </p>
              </div>
              <button
                onClick={() => setDetailJob(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Role Overview
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {detailJob.description}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                Eligibility & Candidate Requirements
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {parseJsonArray(detailJob.requirements).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                Target Technologies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parseJsonArray(detailJob.skills).map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                Package CTC: <strong className="text-slate-900">{detailJob.salary}</strong>
              </span>
              <button
                onClick={() => {
                  handleApplyJob(detailJob);
                  setDetailJob(null);
                }}
                className="btn-primary text-xs py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply for Opening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
