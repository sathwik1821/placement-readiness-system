import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Filter,
  Layers,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

export default function TakeTest() {
  const { attemptId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins for 20 questions
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL', 'INCORRECT', 'CORRECT', 'SKIPPED'
  const [loading, setLoading] = useState(true);

  // Load questions or existing attempt review
  useEffect(() => {
    async function initTestOrReview() {
      try {
        if (!attemptId) return;

        let resolvedCatId = categoryId;

        // First check if attempt is already completed/submitted or retrieve category
        try {
          const revRes = await api.get(`/assessments/attempts/${attemptId}/review`);
          if (revRes.data && (revRes.data.attempt?.status === 'COMPLETED' || revRes.data.attempt?.status === 'LATE_SUBMISSION')) {
            setResult(revRes.data);
            setLoading(false);
            return;
          }
          if (revRes.data?.attempt?.testCategoryId) {
            resolvedCatId = revRes.data.attempt.testCategoryId;
          }
        } catch {
          // If review not ready yet, continue to take test
        }

        // Fetch questions for test session
        const targetCatId = resolvedCatId || categoryId;
        if (targetCatId) {
          const res = await api.get(`/assessments/categories/${targetCatId}/questions`);
          setQuestions(res.data || []);
        }
      } catch (err) {
        console.error('Failed initializing test session', err);
      } finally {
        setLoading(false);
      }
    }
    initTestOrReview();
  }, [attemptId, categoryId]);

  // Countdown timer during live test
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
      // Trigger background analysis recalculation
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading assessment session...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: POST-TEST ANALYSIS & DETAILED ANSWER KEY REVIEW
  // =========================================================================
  if (result) {
    const summary = result.summary || {};
    const questionReviews = result.questions || [];
    const pct = Math.round(summary.percentageScore ?? result.attempt?.percentageScore ?? 0);
    const totalQ = summary.totalQuestions || questionReviews.length || 20;
    const correctCount = summary.correctCount || questionReviews.filter((q) => q.isCorrect).length;
    const incorrectCount = summary.incorrectCount || questionReviews.filter((q) => q.isAttempted && !q.isCorrect).length;
    const skippedCount = summary.skippedCount || questionReviews.filter((q) => !q.isAttempted).length;
    const categoryName = summary.categoryName || 'Assessment Test';

    const isPassed = pct >= 70;

    const filteredQuestions = questionReviews.filter((q) => {
      if (reviewFilter === 'INCORRECT') return q.isAttempted && !q.isCorrect;
      if (reviewFilter === 'CORRECT') return q.isCorrect;
      if (reviewFilter === 'SKIPPED') return !q.isAttempted;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
        {/* Executive Score & Performance Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Assessment Completed & Verified</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {categoryName} • Test Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Review your detailed question-by-question breakdown, identify incorrect answers, and study concept explanations to close technical skill deficits.
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="flex flex-col items-center justify-center bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 min-w-[170px] text-center shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Final Score
              </span>
              <div
                className={`text-4xl font-black font-mono my-1 ${
                  pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400'
                }`}
              >
                {pct}%
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  pct >= 70
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : pct >= 50
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                {pct >= 70 ? 'Verified Mastery' : pct >= 50 ? 'Competent' : 'Needs Practice'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block font-medium">Marks Scored</span>
              <span className="text-base font-black text-white font-mono">
                {summary.totalScore ?? result.attempt?.totalScore} / {summary.totalMarks ?? result.attempt?.totalMarks}
              </span>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
              <span className="text-[11px] text-emerald-400 block font-medium">Correct Answers</span>
              <span className="text-base font-black text-emerald-300 font-mono">
                {correctCount} / {totalQ}
              </span>
            </div>

            <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
              <span className="text-[11px] text-rose-400 block font-medium">Incorrect Answers</span>
              <span className="text-base font-black text-rose-300 font-mono">
                {incorrectCount} / {totalQ}
              </span>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block font-medium">Unattempted / Skipped</span>
              <span className="text-base font-black text-slate-300 font-mono">
                {skippedCount} / {totalQ}
              </span>
            </div>
          </div>
        </div>

        {/* Action Header & Filter Tabs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Questions:
            </span>
            <button
              onClick={() => setReviewFilter('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reviewFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Questions ({totalQ})
            </button>
            <button
              onClick={() => setReviewFilter('INCORRECT')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reviewFilter === 'INCORRECT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setReviewFilter('CORRECT')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reviewFilter === 'CORRECT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setReviewFilter('SKIPPED')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reviewFilter === 'SKIPPED'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Skipped ({skippedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/analysis"
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-2 px-3.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>View Updated AI Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/student/tests"
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3.5 rounded-xl transition-colors shrink-0"
            >
              Tests Hub
            </Link>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-5">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No questions match this filter</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch filter to 'All Questions' to view full list.</p>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const originalIndex = questionReviews.findIndex((item) => item.questionId === q.questionId);
              const isCorrect = q.isCorrect;
              const isAttempted = q.isAttempted;
              const isWrong = isAttempted && !isCorrect;

              return (
                <div
                  key={q.questionId || idx}
                  className={`bg-white border rounded-2xl p-6 shadow-xs transition-all ${
                    isCorrect
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : isWrong
                      ? 'border-rose-200 hover:border-rose-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Question Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                        Q{originalIndex >= 0 ? originalIndex + 1 : idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {q.difficulty || 'MEDIUM'}
                      </span>
                      {q.topic && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {q.topic}
                        </span>
                      )}
                    </div>

                    {/* Correctness Badge */}
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct (+{q.marks || 1} Mark)</span>
                        </span>
                      ) : isWrong ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Incorrect (-{q.negativeMarks || 0.25} Mark)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                          <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Unattempted (0 Marks)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                    {q.questionText}
                  </p>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {(q.options || []).map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrectAnswer = (q.correctAnswer || '').trim().toLowerCase() === (opt || '').trim().toLowerCase();
                      const isUserChoice = (q.selectedAnswer || '').trim().toLowerCase() === (opt || '').trim().toLowerCase();

                      let optionCardClass = 'border-slate-200 bg-white text-slate-700';
                      let letterBadgeClass = 'bg-slate-100 text-slate-600';

                      if (isCorrectAnswer) {
                        optionCardClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500/20';
                        letterBadgeClass = 'bg-emerald-600 text-white';
                      } else if (isUserChoice && !isCorrect) {
                        optionCardClass = 'border-rose-400 bg-rose-50/70 text-rose-950 font-semibold ring-1 ring-rose-400/20';
                        letterBadgeClass = 'bg-rose-600 text-white';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${optionCardClass}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${letterBadgeClass}`}>
                              {letter}
                            </span>
                            <span className="leading-snug break-words">{opt}</span>
                          </div>

                          {/* Option Tag indicator */}
                          <div className="shrink-0 text-[10px] font-black uppercase">
                            {isCorrectAnswer && isUserChoice && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white inline-flex items-center gap-1">
                                <Check className="w-3 h-3" /> Correct
                              </span>
                            )}
                            {isCorrectAnswer && !isUserChoice && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 inline-flex items-center gap-1">
                                <Check className="w-3 h-3" /> Correct Option
                              </span>
                            )}
                            {!isCorrectAnswer && isUserChoice && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white inline-flex items-center gap-1">
                                <X className="w-3 h-3" /> Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational Concept & Option Explanation Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider text-[11px]">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Concept & Answer Explanation</span>
                    </div>
                    <p className="leading-relaxed font-medium text-slate-800">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/student/tests"
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-5 rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Take Another Assessment</span>
          </Link>
          <Link
            to="/student/analysis"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 justify-center"
          >
            <span>Review Calibrated AI Career Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: LIVE ASSESSMENT IN-PROGRESS (20 QUESTIONS)
  // =========================================================================
  if (questions.length === 0) {
    return (
      <div className="bg-white text-center py-12 border border-slate-200 rounded-2xl p-6 max-w-xl mx-auto shadow-xs">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">No Assessment Questions Configured</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please contact the administrator or placement cell to populate this category.
        </p>
        <button
          onClick={() => navigate('/student/tests')}
          className="mt-4 text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
        >
          Return to Test Suite
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Test Header Bar */}
      <div className="bg-white py-4 px-6 flex items-center justify-between border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Timed Assessment Session
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Question {currentIndex + 1} of {totalCount}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Progress</span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {answeredCount} / {totalCount} Answered
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-sm font-black text-blue-900 tracking-wider">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Jump Dots */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answers[q.id]);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
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
      <div className="bg-white shadow-xs border border-slate-200 rounded-2xl p-7">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {currentQ.difficulty || 'MEDIUM'}
          </span>
          {currentQ.topic && (
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {currentQ.topic}
            </span>
          )}
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
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
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
          className="btn-secondary disabled:opacity-40 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex === totalCount - 1 ? (
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
          >
            {submitting ? 'Submitting & Evaluating...' : 'Submit & View Detailed Analysis'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
