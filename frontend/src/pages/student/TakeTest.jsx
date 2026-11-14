import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TakeTest() {
  const { attemptId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        if (!categoryId) return;
        const res = await api.get(`/assessments/categories/${categoryId}/questions`);
        setQuestions(res.data || []);
      } catch (err) {
        console.error('Failed fetching test questions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [categoryId]);

  useEffect(() => {
    if (result || submitting || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, submitting, timeLeft]);

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitAnswers = async () => {
    if (submitting || result) return;
    setSubmitting(true);

    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || '',
        timeTaken: 15
      }));

      const res = await api.post(`/assessments/attempts/${attemptId}/submit`, { responses: payload });
      setResult(res.data);
      api.post('/analysis/generate').catch(() => {});
    } catch (err) {
      alert('Error submitting test: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (result) {
    const pct = Math.round(result.percentageScore);
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="card bg-white text-center shadow-sm border border-slate-200 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Submitted Successfully</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Automated grading complete. Scores have been dispatched to the AI Analysis Engine.
          </p>

          <div className="my-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 inline-block w-full max-w-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Final Evaluated Score
            </span>
            <div className="text-5xl font-extrabold text-slate-900">
              {pct}%
            </div>
            <p className="text-xs font-medium text-gray-500 mt-2">
              Raw Score: {result.totalScore} / {result.totalMarks} Marks
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/student/analysis')}
              className="btn-primary bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 px-4 shadow-sm font-semibold text-xs flex items-center gap-1.5"
            >
              <span>View My Analysis & Gaps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/student/tests')}
              className="btn-secondary rounded-xl py-2 px-4 text-xs font-semibold"
            >
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card bg-white text-center py-12 border border-gray-200 rounded-2xl p-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-gray-800">No Assessment Questions Configured</h2>
        <p className="text-xs text-gray-500 mt-1">
          Please contact the administrator or placement cell to populate this category.
        </p>
        <button onClick={() => navigate('/student/tests')} className="btn-secondary mt-4 text-xs font-semibold">
          Return to Test Suite
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Test Header Bar */}
      <div className="card bg-white py-4 px-6 flex items-center justify-between border border-slate-200 rounded-xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Timed Examination Session
          </span>
          <h2 className="text-sm font-bold text-gray-900 mt-0.5">
            Question {currentIndex + 1} of {totalCount}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Completed</span>
            <span className="text-xs font-bold text-gray-700">
              {answeredCount} / {totalCount} Answered
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-sm font-bold text-blue-900 tracking-wider">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Question Jump Dots */}
      <div className="flex flex-wrap gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answers[q.id]);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="card bg-white shadow-sm border border-slate-200 rounded-2xl p-7">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-blue text-xs font-bold uppercase">{currentQ.difficulty || 'MEDIUM'}</span>
          {currentQ.topic && <span className="badge-gray text-xs font-bold uppercase">{currentQ.topic}</span>}
          <span className="text-xs font-bold text-slate-500 ml-auto font-mono">
            Marks: +{currentQ.marks} | Neg: -{currentQ.negativeMarks}
          </span>
        </div>

        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6">
          {currentQ.questionText}
        </p>

        <div className="space-y-3">
          {(currentQ.options || []).map((opt, idx) => {
            const isSelected = answers[currentQ.id] === opt;
            const letter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-xs sm:text-sm leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-40 text-xs font-semibold py-2 px-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex === totalCount - 1 ? (
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting}
            className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl shadow-sm text-xs"
          >
            {submitting ? 'Submitting...' : 'Complete & Submit Assessment'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs flex items-center gap-1.5"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
