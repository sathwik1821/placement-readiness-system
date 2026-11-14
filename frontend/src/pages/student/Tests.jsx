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
  Cpu
} from 'lucide-react';

export default function Tests() {
  const [categories, setCategories] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAssessments() {
      try {
        const [catRes, attRes] = await Promise.all([
          api.get('/assessments/categories'),
          api.get('/assessments/attempts').catch(() => ({ data: [] }))
        ]);
        setCategories(catRes.data || []);
        setAttempts(attRes.data || []);
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
      .filter((a) => a.testCategoryId === catId && a.status === 'COMPLETED')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const commonTests = categories.filter((c) => c.type === 'COMMON');
  const techTests = categories.filter((c) => c.type === 'TECHNICAL');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Placement Assessment Suites
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Objective timed evaluations mapped to your career goal benchmark competency vectors.
        </p>
      </div>

      {/* Foundational Tests */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">
            Common Foundational Assessments
          </h2>
          <span className="text-xs text-gray-500">
            (Aptitude, Reasoning, Verbal & Communication)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonTests.map((cat) => {
            const latest = getLatestAttempt(cat.id);
            const isStarting = startingId === cat.id;

            return (
              <div
                key={cat.id}
                className="card bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                    {latest ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          latest.percentageScore >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : latest.percentageScore >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Score: {latest.percentageScore}%
                      </span>
                    ) : (
                      <span className="badge-gray text-xs">Unattempted</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cat._count?.questions || 10} Questions</span>
                    </span>
                    <span>• Timed 20m</span>
                  </div>

                  <button
                    onClick={() => handleStartTest(cat.id)}
                    disabled={isStarting}
                    className="btn-primary text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 font-semibold"
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

      {/* Technical Domain Tests */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">
            Domain-Specific Technical Assessments
          </h2>
          <span className="text-xs text-gray-500">
            (Data Structures, DBMS, OOP, Operating Systems, Networks)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techTests.map((cat) => {
            const latest = getLatestAttempt(cat.id);
            const isStarting = startingId === cat.id;

            return (
              <div
                key={cat.id}
                className="card bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mt-0.5">
                        Domain: {cat.domain || 'Core Engineering'}
                      </span>
                    </div>
                    {latest ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          latest.percentageScore >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : latest.percentageScore >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Score: {latest.percentageScore}%
                      </span>
                    ) : (
                      <span className="badge-gray text-xs">Unattempted</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cat._count?.questions || 10} Questions</span>
                    </span>
                    <span>• Timed 25m</span>
                  </div>

                  <button
                    onClick={() => handleStartTest(cat.id)}
                    disabled={isStarting}
                    className="btn-primary text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 font-semibold"
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
