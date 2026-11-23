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
  Clock,
  Sparkles,
  Loader2,
  Layers,
  Code2,
  Cpu,
  BarChart3,
  Coffee
} from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(false);

  const careerTracks = [
    {
      role: 'Java Full Stack Developer',
      shortName: 'Java Full Stack',
      icon: Coffee,
      stack: 'Spring Boot • React • SQL • DSA',
      focus: 'Enterprise microservices, JPA/Hibernate, and React web applications',
      badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      role: 'MERN Full Stack Developer',
      shortName: 'MERN Stack',
      icon: Code2,
      stack: 'React • Node.js • Express • MongoDB',
      focus: 'Modern JavaScript web apps, asynchronous APIs, and reactive frontends',
      badgeClass: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    },
    {
      role: 'AI / ML Engineer',
      shortName: 'AI / ML Track',
      icon: Cpu,
      stack: 'Python • Machine Learning • Deep Learning',
      focus: 'Predictive modeling, neural architectures, and algorithmic optimization',
      badgeClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    },
    {
      role: 'Data Analyst',
      shortName: 'Data Analytics',
      icon: BarChart3,
      stack: 'Advanced SQL • PowerBI • Pandas • Statistics',
      focus: 'Business intelligence, data warehousing, and quantitative reporting',
      badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }
  ];

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

  const handleSwitchRole = async (newRole) => {
    if (newRole === targetRole || switchingRole) return;
    setSwitchingRole(true);
    try {
      await api.put('/students/career-goal', { targetRole: newRole });
      const [profRes, repRes] = await Promise.all([
        api.get('/students/profile'),
        api.post('/analysis/generate')
      ]);
      setProfile(profRes.data);
      setReport(repRes.data);
    } catch (err) {
      alert('Error changing target career role: ' + (err.response?.data?.error || err.message));
    } finally {
      setSwitchingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading your placement profile...</p>
        </div>
      </div>
    );
  }

  const cleanScore = report?.readinessScore || 0;
  const rawRole = profile?.careerGoal?.targetRole || 'Java Full Stack Developer';
  const targetRole = careerTracks.some((t) => t.role === rawRole)
    ? rawRole
    : 'Java Full Stack Developer';

  const activeTrackMeta = careerTracks.find((t) => t.role === targetRole) || careerTracks[0];
  const eligibleDrives = drives.filter((d) => d.isEligible);

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
    <div className="space-y-8 font-sans">
      {/* Top Banner Greeting */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              {profile?.college || 'RGUKT Srikakulam'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              {profile?.batch || `${profile?.graduationYear || 2027} Graduating Batch • B.Tech E4`}
            </span>
            {profile?.rollNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold">
                ID: {profile.rollNumber}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Welcome, {profile?.name || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Department of {profile?.department || 'Computer Science & Engineering'} • Academic CGPA: <strong className="text-white font-bold">{profile?.cgpa}</strong>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-400">Active Evaluation Track:</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
              {targetRole}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/student/tests"
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xs font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-white" />
            <span>Take Track Tests</span>
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

      {/* Target Role Control & Track Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Active Career Target & Benchmark Selector
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your desired industry track to dynamically calibrate competency weights, radar benchmarks, and skill gaps.
            </p>
          </div>

          {switchingRole && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Calibrating AI Benchmarks...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {careerTracks.map((trk) => {
            const Icon = trk.icon;
            const isSelected = targetRole === trk.role;

            return (
              <button
                key={trk.role}
                type="button"
                disabled={switchingRole}
                onClick={() => handleSwitchRole(trk.role)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    {isSelected && (
                      <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    {trk.shortName}
                  </h3>
                  <p className="text-[11px] font-mono text-blue-700 font-bold mt-1">
                    {trk.stack}
                  </p>
                </div>

                <p className="text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100 line-clamp-2">
                  {trk.focus}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Gauge Card */}
        <div className="flex flex-col items-center justify-between text-center bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div className="w-full">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Placement Readiness Score</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Calibrated for {targetRole}
            </p>
          </div>

          <div className="my-4">
            <ReadinessGauge score={cleanScore} />
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-left">
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {report?.aiFeedback || 'Take tests to unlock explainable readiness analytics.'}
            </p>
            <Link
              to="/student/analysis"
              className="mt-2.5 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>Explore full diagnostic breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Competency Strengths & Critical Gaps */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Competency Matrix vs {targetRole} Benchmark
                </h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                {activeTrackMeta.shortName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Identified Track Strengths</span>
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
                    Complete track assessments to register verified strengths.
                  </p>
                )}
              </div>

              {/* Priority Skill Gaps */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4">
                <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                  <span>Prioritized Track Skill Gaps</span>
                </h3>
                {parsedGaps.length > 0 ? (
                  <div className="space-y-2">
                    {parsedGaps.slice(0, 3).map((gp, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-rose-950 block">{gp.skill}</span>
                          <span className="text-[11px] font-semibold text-rose-800">
                            Observed {gp.observed}% vs Req {gp.required}%
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-200 text-rose-900">
                          {gp.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-800 font-medium">
                    No critical deficits flagged against {activeTrackMeta.shortName} standards.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">
              Evaluates: {activeTrackMeta.stack}
            </span>
            <Link
              to="/student/analysis"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View Targeted Learning Paths</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Dual Columns: Recent Tests & Eligible Drives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Assessment Attempts */}
        <div className="bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Assessment History</span>
            </h2>
            <Link to="/student/tests" className="text-xs font-bold text-blue-600 hover:underline">
              Take Tests →
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Assessment Records Found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Attempt assessments mapped to your {activeTrackMeta.shortName} track.
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
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {att.percentageScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      {att.percentageScore >= 70 ? 'Passed' : 'Needs Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Eligible Drives */}
        <div className="bg-white shadow-xs border border-slate-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Eligible Placement Drives</span>
            </h2>
            <Link to="/student/placement" className="text-xs font-bold text-blue-600 hover:underline">
              View All Drives →
            </Link>
          </div>

          {eligibleDrives.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Matching Campus Drives</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Check back as recruiters publish new campus hiring drives.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleDrives.slice(0, 3).map((drv) => (
                <div
                  key={drv.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{drv.title}</h3>
                    <p className="text-xs text-slate-500">
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
