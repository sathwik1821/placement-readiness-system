import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Bot,
  Send,
  Sparkles,
  Award,
  History,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Play
} from 'lucide-react';

export default function MockInterview() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [historyResponses, setHistoryResponses] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [creating, setCreating] = useState(false);

  const [targetRole, setTargetRole] = useState('Software Developer');
  const [interviewType, setInterviewType] = useState('TECHNICAL');

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await api.get('/interviews/sessions');
        setSessions(res.data || []);
      } catch (err) {
        console.error('Failed fetching interview sessions', err);
      }
    }
    fetchSessions();
  }, []);

  const handleStartInterview = async () => {
    setCreating(true);
    try {
      const res = await api.post('/interviews/sessions', {
        targetRole,
        interviewType
      });
      setActiveSession(res.data.session);
      setCurrentQuestion(res.data.question);
      setHistoryResponses([]);
      setIsCompleted(false);
      setFinalScorecard(null);
      setAnswerText('');
    } catch (err) {
      alert('Error initiating interview: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !activeSession || !currentQuestion) return;
    setEvaluating(true);

    try {
      const res = await api.post(`/interviews/sessions/${activeSession.id}/answer`, {
        questionId: currentQuestion.id,
        responseText: answerText
      });

      setHistoryResponses((prev) => [
        ...prev,
        {
          question: currentQuestion,
          response: res.data.response
        }
      ]);

      setAnswerText('');

      if (res.data.isComplete || !res.data.followUp) {
        const compRes = await api.post(`/interviews/sessions/${activeSession.id}/complete`);
        setIsCompleted(true);
        setFinalScorecard(compRes.data);
        // Refresh session list
        const updatedSessions = await api.get('/interviews/sessions');
        setSessions(updatedSessions.data || []);
      } else {
        setCurrentQuestion(res.data.followUp);
      }
    } catch (err) {
      alert('Evaluation error: ' + (err.response?.data?.error || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Role-Aligned AI Mock Interview Engine
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Adaptive questioning, natural language response evaluation, and instant rubric scoring.
        </p>
      </div>

      {!activeSession && (
        <div className="card max-w-xl mx-auto shadow-sm border border-slate-200 bg-white rounded-2xl p-7">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Configure New Interview Simulation
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Choose your focus domain and simulation rubric type.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input font-semibold"
              >
                <option value="Software Developer">Software Developer (SDE-1)</option>
                <option value="Full Stack Developer">Full Stack Web Engineer</option>
                <option value="Systems Engineer">Systems & Embedded Engineer</option>
                <option value="Data Analyst">Data Analyst & Quantitative Trainee</option>
              </select>
            </div>

            <div>
              <label className="label">Interview Assessment Category</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="input font-semibold"
              >
                <option value="TECHNICAL">Technical Deep-Dive (Architecture & CS Fundamentals)</option>
                <option value="BEHAVIORAL">Behavioral & Situation Leadership (STAR Framework)</option>
                <option value="MIXED">Comprehensive Mixed Recruitment Round</option>
              </select>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={creating}
              className="btn-primary w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all"
            >
              <Play className="w-4 h-4 stroke-[2.5]" />
              <span>{creating ? 'Launching AI Session...' : 'Initiate Interview Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Q&A Interface */}
      {activeSession && !isCompleted && currentQuestion && (
        <div className="card max-w-3xl mx-auto shadow-sm border border-slate-200 bg-white rounded-2xl p-7">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="badge-blue text-xs font-bold uppercase">{activeSession.interviewType}</span>
              <span className="text-xs font-black text-slate-800">{activeSession.targetRole}</span>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Turn {historyResponses.length + 1} of 4
            </span>
          </div>

          {/* Conversation History */}
          {historyResponses.length > 0 && (
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {historyResponses.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 shrink-0">Interviewer:</span>
                    <p className="text-gray-800 font-semibold">{item.question.questionText}</p>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-200/50">
                    <span className="font-bold text-gray-600 shrink-0">Your Answer:</span>
                    <p className="text-gray-700">{item.response.responseText}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-100 text-blue-900 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        AI Response Rubric Feedback
                      </span>
                      <span className="text-xs text-blue-700 font-mono font-semibold">
                        Tech: {item.response.technicalScore}% | Comm: {item.response.communicationScore}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{item.response.aiFeedback}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active AI Question */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>AI Technical Interviewer Asking:</span>
            </span>
            <p className="text-base font-bold text-gray-900 leading-snug">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Student Response Input */}
          <div className="space-y-3">
            <label className="label">
              Your Verbal Response (Type structured explanation)
            </label>
            <textarea
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="State your technical premise clearly. Provide concrete algorithms, architecture trade-offs, or real project experiences..."
              className="input resize-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating || !answerText.trim()}
                className="btn-primary bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{evaluating ? 'Evaluating NLP Rubric...' : 'Submit & Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Scorecard */}
      {isCompleted && finalScorecard && (
        <div className="card max-w-2xl mx-auto shadow-sm text-center border-2 border-emerald-300 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Interview Simulation Completed
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Evaluated by the NLP Rubric Engine across Technical Depth and Professional Clarity.
          </p>

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Overall Score
              </span>
              <span className="text-4xl font-black font-mono text-slate-900 mt-1 block">
                {finalScorecard.overallScore}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Technical Depth
              </span>
              <span className="text-4xl font-black font-mono text-emerald-700 mt-1 block">
                {finalScorecard.technicalScore}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Communication
              </span>
              <span className="text-4xl font-black font-mono text-blue-700 mt-1 block">
                {finalScorecard.communicationScore}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-900 leading-relaxed mb-6">
            <strong className="block text-slate-900 font-bold mb-1">Qualitative Synthesis:</strong>
            {finalScorecard.feedback}
          </div>

          <button
            onClick={() => setActiveSession(null)}
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 px-5 font-semibold text-xs transition-colors"
          >
            Start Another Simulation
          </button>
        </div>
      )}

      {/* Past Interview History */}
      {sessions.length > 0 && !activeSession && (
        <section className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Past Mock Interview Records
            </h2>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-blue text-xs font-semibold">{sess.interviewType}</span>
                    <h3 className="text-xs font-bold text-gray-900">{sess.targetRole}</h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Conducted on {new Date(sess.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">
                    {sess.overallScore}%
                  </span>
                  <span className="block text-xs text-gray-400">Final Score</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
