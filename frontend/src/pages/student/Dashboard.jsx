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
  AlertCircle,
  MapPin,
  Compass,
  BookOpen,
  WifiOff,
  ExternalLink,
  ChevronRight,
  Code2
} from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [drives, setDrives] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    try {
      const [profRes, repRes, attRes, drvRes, catRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/analysis/report').catch(() => ({ data: null })),
        api.get('/assessments/attempts').catch(() => ({ data: [] })),
        api.get('/placement/drives').catch(() => ({ data: [] })),
        api.get('/assessments/categories').catch(() => ({ data: [] }))
      ]);
      setProfile(profRes.data);
      setReport(repRes.data);
      setAttempts(attRes.data || []);
      setDrives(drvRes.data || []);
      setCategories(catRes.data || []);
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

  // Map category ID to name
  const categoryMap = {};
  categories.forEach((c) => {
    if (c.id && c.name) categoryMap[c.id] = c.name;
  });

  // Map category scores from completed attempts
  const categoryScores = {};
  attempts.forEach((att) => {
    const catName = att.category?.name || categoryMap[att.testCategoryId];
    if (catName && (att.status === 'COMPLETED' || att.status === 'LATE_SUBMISSION' || att.percentageScore > 0)) {
      const cur = categoryScores[catName] || 0;
      if (att.percentageScore > cur) {
        categoryScores[catName] = Math.round(att.percentageScore);
      }
    }
  });

  // Also extract from report breakdown if available
  let parsedBreakdown = {};
  try {
    parsedBreakdown = typeof report?.readinessBreakdown === 'string'
      ? JSON.parse(report.readinessBreakdown)
      : (report?.readinessBreakdown || {});
  } catch {
    parsedBreakdown = {};
  }

  // Visual sequential learning roadmap by career track
  const careerRoadmaps = {
    'Java Full Stack Developer': [
      { step: 1, skillKey: 'OOP Concepts', title: 'Core Java & OOP', benchmark: 75 },
      { step: 2, skillKey: 'Data Structures & Algorithms', title: 'DSA & Problem Solving', benchmark: 75 },
      { step: 3, skillKey: 'DBMS', title: 'DBMS & SQL', benchmark: 75 },
      { step: 4, skillKey: 'Java & Spring Boot', title: 'Spring Boot & APIs', benchmark: 80 },
      { step: 5, skillKey: 'Web Frontend & React', title: 'React Frontend', benchmark: 70 },
      { step: 6, skillKey: 'Quantitative Aptitude', title: 'Campus Aptitude', benchmark: 70 }
    ],
    'MERN Full Stack Developer': [
      { step: 1, skillKey: 'OOP Concepts', title: 'JavaScript & ES6+ OOP', benchmark: 70 },
      { step: 2, skillKey: 'Data Structures & Algorithms', title: 'DSA & Algorithms', benchmark: 70 },
      { step: 3, skillKey: 'DBMS', title: 'Database & Modeling', benchmark: 75 },
      { step: 4, skillKey: 'Node.js & Backend Architecture', title: 'Node.js & Express', benchmark: 80 },
      { step: 5, skillKey: 'Web Frontend & React', title: 'React Frontend', benchmark: 85 },
      { step: 6, skillKey: 'Logical Reasoning', title: 'Cognitive Reasoning', benchmark: 70 }
    ],
    'AI / ML Engineer': [
      { step: 1, skillKey: 'OOP Concepts', title: 'Python & OOP', benchmark: 75 },
      { step: 2, skillKey: 'Quantitative Aptitude', title: 'Math & Probability', benchmark: 80 },
      { step: 3, skillKey: 'Data Structures & Algorithms', title: 'DSA & Algorithmic Logic', benchmark: 75 },
      { step: 4, skillKey: 'DBMS', title: 'SQL & Data Engineering', benchmark: 70 },
      { step: 5, skillKey: 'Machine Learning & Python', title: 'ML & Neural Networks', benchmark: 85 },
      { step: 6, skillKey: 'Logical Reasoning', title: 'Logical Deduction', benchmark: 75 }
    ],
    'Data Analyst': [
      { step: 1, skillKey: 'DBMS', title: 'Relational DB & SQL', benchmark: 80 },
      { step: 2, skillKey: 'Quantitative Aptitude', title: 'Math & Statistics', benchmark: 75 },
      { step: 3, skillKey: 'Data Analytics & BI (SQL/Tableau)', title: 'BI & Tableau Analytics', benchmark: 85 },
      { step: 4, skillKey: 'Logical Reasoning', title: 'Data Interpretation', benchmark: 75 },
      { step: 5, skillKey: 'Verbal Ability', title: 'Business Communication', benchmark: 70 }
    ],
    'Cloud & DevOps Engineer': [
      { step: 1, skillKey: 'Operating Systems', title: 'Linux & OS Internals', benchmark: 80 },
      { step: 2, skillKey: 'Computer Networks', title: 'Networking & HTTP', benchmark: 80 },
      { step: 3, skillKey: 'Data Structures & Algorithms', title: 'Automation & DSA', benchmark: 65 },
      { step: 4, skillKey: 'DBMS', title: 'Database Administration', benchmark: 70 },
      { step: 5, skillKey: 'Logical Reasoning', title: 'Systems Troubleshooting', benchmark: 70 }
    ]
  };

  const currentRoadmap = careerRoadmaps[targetRole] || careerRoadmaps['Java Full Stack Developer'];

  const getExpertise = (item) => {
    if (categoryScores[item.skillKey] !== undefined) {
      return { score: categoryScores[item.skillKey], attempted: true };
    }
    const bd = parsedBreakdown[item.skillKey];
    if (bd && bd.attempted) {
      return { score: Math.round(bd.score || 0), attempted: true };
    }
    return { score: 0, attempted: false };
  };

  const clearedCount = currentRoadmap.filter((item) => {
    const { score, attempted } = getExpertise(item);
    return attempted && score >= item.benchmark;
  }).length;

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
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Need internet connection: You are currently offline. Please check your network connection to sync readiness models, take tests, and access external roadmaps.</span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-amber-200 text-amber-900 text-[11px] font-bold shrink-0 uppercase tracking-wider">
            Offline Mode
          </span>
        </div>
      )}

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
              {report?.aiFeedback || 'Complete assessment tests to generate dynamic diagnostic insights and identify growth areas.'}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Detailed diagnostic breakdown highlights skill growth areas and dynamic curriculum.
              </span>
              <Link
                to="/student/analysis"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <span>View Detailed Readiness Analysis & Growth Areas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Learning Path & Numerical Expertise Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {targetRole} Learning Path
              </h2>
              <p className="text-xs text-slate-500">
                Visual milestone sequence with verified numerical expertise in each core domain.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              Path Progress: <strong className="text-emerald-700">{clearedCount}</strong> / {currentRoadmap.length} Cleared
            </span>
            <Link
              to="/student/analysis"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 shrink-0"
            >
              <span>Full Curriculum & Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Visual Stepper Track with Connecting Line */}
        <div className="relative pt-1">
          {/* Background Connecting Line on Desktop */}
          <div className="hidden lg:block absolute top-[28px] left-10 right-10 h-0.5 bg-slate-200 z-0" />

          {/* Responsive Milestone Cards Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 ${currentRoadmap.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-6'} gap-3.5 relative z-10`}>
            {currentRoadmap.map((item, idx) => {
              const { score, attempted } = getExpertise(item);
              const isMastered = attempted && score >= item.benchmark;
              const isCompetent = attempted && score >= 50 && score < item.benchmark;
              const isNeedsFocus = attempted && score < 50;

              let cardBorder = 'border-slate-200 hover:border-slate-300 bg-white';
              let stepCircleStyle = 'bg-white text-slate-500 border-slate-300';
              let scoreColor = 'text-slate-400';
              let barColor = 'bg-slate-200';
              let statusText = 'Not Started';
              let statusBadgeColor = 'text-slate-500 bg-slate-100 border-slate-200';

              if (isMastered) {
                cardBorder = 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400 ring-1 ring-emerald-500/10';
                stepCircleStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                scoreColor = 'text-emerald-700';
                barColor = 'bg-emerald-500';
                statusText = 'Mastered';
                statusBadgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
              } else if (isCompetent) {
                cardBorder = 'border-blue-300 bg-blue-50/20 hover:border-blue-400 ring-1 ring-blue-500/10';
                stepCircleStyle = 'bg-blue-600 text-white border-blue-600 shadow-xs';
                scoreColor = 'text-blue-700';
                barColor = 'bg-blue-500';
                statusText = 'Competent';
                statusBadgeColor = 'text-blue-800 bg-blue-100 border-blue-300';
              } else if (isNeedsFocus) {
                cardBorder = 'border-amber-300 bg-amber-50/20 hover:border-amber-400 ring-1 ring-amber-500/10';
                stepCircleStyle = 'bg-amber-600 text-white border-amber-600 shadow-xs';
                scoreColor = 'text-amber-700';
                barColor = 'bg-amber-500';
                statusText = 'Needs Focus';
                statusBadgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
              }

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-xs ${cardBorder}`}
                >
                  {/* Top: Step Circle & Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black font-mono shrink-0 ${stepCircleStyle}`}>
                        {isMastered ? '✓' : item.step}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        Step {item.step}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 min-h-[32px]">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                      Goal: {item.benchmark}%
                    </span>
                  </div>

                  {/* Expertise in a Number */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expertise</span>
                      <span className={`text-xl font-black font-mono ${scoreColor}`}>
                        {attempted ? `${score}%` : '0%'}
                      </span>
                    </div>

                    {/* Visual Progress Meter */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>

                    {/* Footer: Status Badge & Quick Action */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadgeColor}`}>
                        {statusText}
                      </span>
                      <Link
                        to="/student/tests"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                      >
                        <span>{attempted ? 'Retest' : 'Start'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-slate-900">{att.category?.name || 'Assessment'}</h3>
                        <Link
                          to={`/student/tests/${att.id}`}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Analysis & Key →</span>
                        </Link>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Score: <strong className="text-slate-800">{att.totalScore} / {att.totalMarks}</strong> Marks
                        {att.completedAt && (
                          <span className="text-slate-400 text-[11px] ml-2">
                            • {new Date(att.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
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
                      <Link
                        to={`/student/tests/${att.id}`}
                        className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 transition-colors"
                        title="View Detailed Question Analysis"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
