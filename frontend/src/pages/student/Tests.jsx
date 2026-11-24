import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { ROLE_RECOMMENDED_TESTS, getCareerTrack } from '../../utils/careerStandards';

export default function Tests() {
  const [categories, setCategories] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [filterMode, setFilterMode] = useState('RECOMMENDED'); // 'RECOMMENDED' or 'ALL'
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAssessments() {
      try {
        const [catRes, attRes, profRes] = await Promise.all([
          api.get('/assessments/categories'),
          api.get('/assessments/attempts').catch(() => ({ data: [] })),
          api.get('/students/profile').catch(() => ({ data: null }))
        ]);
        setCategories(catRes.data || []);
        setAttempts(attRes.data || []);
        setProfile(profRes.data);
      } catch (err) {
        console.error('Failed loading tests data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  const handleStartTest = async (categoryId) => {
    try {
      setStartingId(categoryId);
      const res = await api.post('/assessments/attempts', { testCategoryId: categoryId });
      navigate(`/student/tests/${res.data.id}?category=${categoryId}`);
    } catch (err) {
      alert('Error launching assessment: ' + (err.response?.data?.error || err.message));
    } finally {
      setStartingId(null);
    }
  };

  const getLatestAttempt = (catId) => {
    return attempts
      .filter((a) => a.testCategoryId === catId && (a.status === 'COMPLETED' || a.status === 'LATE_SUBMISSION'))
      .sort((a, b) => new Date(b.completedAt || b.startedAt) - new Date(a.completedAt || a.startedAt))[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rawRole = profile?.careerGoal?.targetRole || profile?.careerTrack || 'Java Full Stack Developer';
  const canonicalTrack = getCareerTrack(rawRole);
  const targetRole = canonicalTrack.role;
  const recommendedList = ROLE_RECOMMENDED_TESTS[targetRole] || [];

  const isMockOrAssignment = (c) => {
    const type = (c.type || '').toUpperCase();
    if (type === 'MOCK' || type === 'ASSIGNMENT') return true;
    const name = (c.name || '').toLowerCase();
    return name.includes('mock') || name.includes('assignment');
  };

  const isCareerMockMatch = (catName, role) => {
    if (!catName) return false;
    const lower = catName.toLowerCase();
    const rLower = (role || '').toLowerCase();

    if (rLower.includes('java')) {
      return lower.includes('java') || lower.includes('spring');
    }
    if (rLower.includes('mern')) {
      return lower.includes('mern') || lower.includes('node') || lower.includes('react');
    }
    if (rLower.includes('ai') || rLower.includes('ml') || rLower.includes('machine learning')) {
      return lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning') || lower.includes('python');
    }
    if (rLower.includes('data')) {
      return lower.includes('data') || lower.includes('analytics') || lower.includes('bi') || lower.includes('tableau');
    }
    return false;
  };

  const getCatType = (c) => {
    if (c.type) return c.type.toUpperCase();
    const name = (c.name || '').toLowerCase();
    if (name.includes('mock') || name.includes('assignment')) return 'MOCK';
    if (['quantitative aptitude', 'logical reasoning', 'verbal ability'].includes(name)) return 'COMMON';
    return 'TECHNICAL';
  };

  const isRecommended = (catName) => {
    if (!catName) return false;
    const lower = catName.toLowerCase();
    if (recommendedList.some((r) => r.toLowerCase() === lower)) return true;
    if (targetRole.toLowerCase().includes('java') && (lower.includes('java') || lower.includes('spring'))) return true;
    if (targetRole.toLowerCase().includes('mern') && (lower.includes('mern') || lower.includes('node'))) return true;
    if (targetRole.toLowerCase().includes('ai') && (lower.includes('machine learning') || lower.includes('python'))) return true;
    if (targetRole.toLowerCase().includes('data') && (lower.includes('analytics') || lower.includes('tableau') || lower.includes('bi'))) return true;
    return false;
  };

  const filteredCategories = filterMode === 'RECOMMENDED'
    ? categories.filter((c) => {
        if (isMockOrAssignment(c)) {
          return isCareerMockMatch(c.name, targetRole);
        }
        return isRecommended(c.name);
      })
    : categories;

  const displayedCategories = (filteredCategories.length === 0 && categories.length > 0)
    ? categories
    : filteredCategories;

  const mockTests = displayedCategories.filter((c) => isMockOrAssignment(c));
  const techTests = displayedCategories.filter((c) => !isMockOrAssignment(c) && getCatType(c) === 'TECHNICAL');
  const commonTests = displayedCategories.filter((c) => !isMockOrAssignment(c) && getCatType(c) === 'COMMON');

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Placement Assessment Suites
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Timed diagnostic tests calibrated directly against your target career track: <strong className="text-blue-700">{targetRole}</strong>.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode('RECOMMENDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${filterMode === 'RECOMMENDED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended for {targetRole.split(' ')[0]}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterMode === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span>All Suites ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* Curated Mock Assessments & Assignments (if available) */}
      {mockTests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-200 pb-2">
            <Sparkles className="w-5 h-5 text-purple-600 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900">
              Mock Assessments & Track Assignments
            </h2>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {mockTests.length} Assigned Suites
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTests.map((cat) => {
              const latest = getLatestAttempt(cat.id);
              const isStarting = startingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="bg-white border-2 border-purple-200/80 rounded-2xl p-5 hover:border-purple-400 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                            {cat.type}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {cat.domain || cat.department || 'Computer Science'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900">{cat.name}</h3>
                      </div>

                      {latest ? (
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${latest.percentageScore >= 70
                              ? 'bg-emerald-100 text-emerald-800'
                              : latest.percentageScore >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            Score: {latest.percentageScore}%
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/student/tests/${latest.id}?category=${cat.id}`)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            View Analysis →
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          Ready for Attempt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{cat.description || 'Targeted mock assessment calibrated for your batch and branch.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cat._count?.questions || 10} Questions</span>
                      </span>
                      <span>• Timed {cat.durationMinutes || 30}m</span>
                    </div>

                    <button
                      onClick={() => handleStartTest(cat.id)}
                      disabled={isStarting}
                      className="text-xs py-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-xs flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                    >
                      {isStarting ? (
                        <span>Loading...</span>
                      ) : latest ? (
                        <>
                          <span>Retake Mock</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Assessment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Technical Domain Tests */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Code2 className="w-5 h-5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-base font-bold text-slate-900">
            Technical & Engineering Modules
          </h2>
          <span className="text-xs font-bold text-slate-500">
            ({techTests.length} Modules Available)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techTests.map((cat) => {
            const latest = getLatestAttempt(cat.id);
            const isStarting = startingId === cat.id;
            const isRec = isRecommended(cat.name);

            return (
              <div
                key={cat.id}
                className={`bg-white border rounded-2xl p-5 hover:shadow-xs transition-all flex flex-col justify-between ${isRec ? 'border-blue-300 ring-1 ring-blue-500/10' : 'border-slate-200/90'
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {cat.department || 'Computer Science'}
                        </span>
                        {isRec && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Track Core</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    </div>

                    {latest ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${latest.percentageScore >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : latest.percentageScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          Score: {latest.percentageScore}%
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/student/tests/${latest.id}?category=${cat.id}`)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          View Analysis →
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Unattempted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cat._count?.questions || 10} Questions</span>
                    </span>
                    <span>• Timed {cat.durationMinutes || 30}m</span>
                  </div>

                  <button
                    onClick={() => handleStartTest(cat.id)}
                    disabled={isStarting}
                    className="text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                  >
                    {isStarting ? (
                      <span>Loading...</span>
                    ) : latest ? (
                      <>
                        <span>Retake Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Foundational Tests */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <BookOpen className="w-5 h-5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-base font-bold text-slate-900">
            Common Foundational Assessments
          </h2>
          <span className="text-xs font-bold text-slate-500">
            (Aptitude, Reasoning & Verbal Ability)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonTests.map((cat) => {
            const latest = getLatestAttempt(cat.id);
            const isStarting = startingId === cat.id;
            const isRec = isRecommended(cat.name);

            return (
              <div
                key={cat.id}
                className={`bg-white border rounded-2xl p-5 hover:shadow-xs transition-all flex flex-col justify-between ${isRec ? 'border-blue-300 ring-1 ring-blue-500/10' : 'border-slate-200/90'
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      {isRec && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1 mb-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Track Core</span>
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    </div>

                    {latest ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${latest.percentageScore >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : latest.percentageScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          Score: {latest.percentageScore}%
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/student/tests/${latest.id}?category=${cat.id}`)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          View Analysis →
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Unattempted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cat._count?.questions || 10} Questions</span>
                    </span>
                    <span>• Timed {cat.durationMinutes || 30}m</span>
                  </div>

                  <button
                    onClick={() => handleStartTest(cat.id)}
                    disabled={isStarting}
                    className="text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                  >
                    {isStarting ? (
                      <span>Loading...</span>
                    ) : latest ? (
                      <>
                        <span>Retake Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
