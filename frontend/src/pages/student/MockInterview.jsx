import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import {
  Bot,
  Send,
  Sparkles,
  Award,
  History,
  CheckCircle2,
  AlertCircle,
  Play,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  User,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText
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

  const [targetRole, setTargetRole] = useState('Java Full Stack Developer');
  const [interviewType, setInterviewType] = useState('TECHNICAL');

  // Voice Speech Recognition & TTS States
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript.trim()) {
          setAnswerText((prev) => (prev ? (prev.trim() + ' ' + finalTranscript.trim()) : finalTranscript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech
  const speakQuestion = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  // Toggle Webcam
  const toggleWebcam = async () => {
    if (webcamEnabled) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamEnabled(true);
      } catch (err) {
        alert('Could not access camera: ' + err.message);
        setWebcamEnabled(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load Past Sessions & Student Profile Target Role
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [profRes, sessRes] = await Promise.all([
          api.get('/students/profile').catch(() => ({ data: null })),
          api.get('/interviews/sessions').catch(() => ({ data: [] }))
        ]);
        if (profRes.data?.careerGoal?.targetRole) {
          setTargetRole(profRes.data.careerGoal.targetRole);
        }
        setSessions(sessRes.data || []);
      } catch (err) {
        console.error('Failed fetching interview data', err);
      }
    }
    fetchInitialData();
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

      if (ttsEnabled) {
        speakQuestion(res.data.question.questionText);
      }
    } catch (err) {
      alert('Error initiating interview: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !activeSession || !currentQuestion) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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
        const updatedSessions = await api.get('/interviews/sessions');
        setSessions(updatedSessions.data || []);
      } else {
        setCurrentQuestion(res.data.followUp);
        if (ttsEnabled) {
          speakQuestion(res.data.followUp.questionText);
        }
      }
    } catch (err) {
      alert('Evaluation error: ' + (err.response?.data?.error || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleViewSessionDetails = async (sessionId) => {
    try {
      const res = await api.get(`/interviews/sessions/${sessionId}/details`);
      setSelectedHistorySession(res.data);
    } catch (err) {
      alert('Failed loading session details: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
            Natural Language Processing Rubric Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI-Assisted Interactive Mock Interview Simulator
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time conversational evaluation combining verbal transcript analysis, technical depth scoring, and automated follow-ups.
          </p>
        </div>

        {activeSession && !isCompleted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? 'Disable Question Audio Readout' : 'Enable Question Audio Readout'}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                ttsEnabled
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
              <span>{ttsEnabled ? 'Audio On' : 'Audio Muted'}</span>
            </button>

            <button
              onClick={toggleWebcam}
              title={webcamEnabled ? 'Turn Off Webcam' : 'Turn On Webcam Preview'}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                webcamEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {webcamEnabled ? <Video className="w-4 h-4 text-emerald-600" /> : <VideoOff className="w-4 h-4" />}
              <span>{webcamEnabled ? 'Camera Active' : 'Camera Off'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Setup Form (when not currently active) */}
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Interview Role Track (From Student Profile)
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {targetRole}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Auto-Calibrated
              </span>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Status & Progress Bar */}
          <div className="card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="badge-blue text-xs font-bold uppercase">{activeSession.interviewType}</span>
              <span className="text-xs font-black text-slate-800">{activeSession.targetRole}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Question {historyResponses.length + 1} of 4
              </span>
              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((historyResponses.length + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Interviewer AI & Webcam Feed */}
            <div className="space-y-4">
              {/* AI Interviewer Avatar Card */}
              <div className="card bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white shadow-sm">
                <div className="relative w-20 h-20 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-10 h-10 text-blue-400" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <h3 className="text-sm font-bold text-white">AI Placement Evaluator</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Role Calibration Engine</p>

                {ttsEnabled && (
                  <button
                    onClick={() => speakQuestion(currentQuestion.questionText)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-300 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Question</span>
                  </button>
                )}
              </div>

              {/* Webcam Preview Container */}
              <div className="card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Candidate Video
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${webcamEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {webcamEnabled ? 'LIVE' : 'STANDBY'}
                  </span>
                </div>

                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${webcamEnabled ? 'block' : 'hidden'}`}
                  />
                  {!webcamEnabled && (
                    <div className="text-center p-4">
                      <User className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Camera preview inactive</p>
                      <button
                        onClick={toggleWebcam}
                        className="mt-2 text-xs font-bold text-blue-400 hover:underline"
                      >
                        Enable Camera
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Active Question & Student Answer Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active AI Question Card */}
              <div className="card bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-700 text-xs font-black uppercase tracking-wider">
                  <Bot className="w-4 h-4 stroke-[2.5]" />
                  <span>Interviewer Query:</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Conversation History Drawer (if any) */}
              {historyResponses.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {historyResponses.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-black text-slate-900 uppercase tracking-wider shrink-0">Q{idx + 1}:</span>
                        <p className="text-slate-700 font-semibold">{item.question.questionText}</p>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                        <span className="font-black text-blue-700 uppercase tracking-wider shrink-0">Your Answer:</span>
                        <p className="text-slate-800">{item.response.responseText}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50/90 border border-blue-200 text-blue-950 mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs flex items-center gap-1.5 text-blue-900">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                            AI Rubric Feedback
                          </span>
                          <span className="text-xs font-mono font-bold text-blue-800">
                            Technical: {item.response.technicalScore}% • Clarity: {item.response.communicationScore}%
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{item.response.aiFeedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Student Answer Input Box */}
              <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label mb-0">
                      Your Response (Verbal Speech or Typed Text)
                    </label>
                    {!speechSupported && (
                      <span className="text-[11px] text-amber-600 font-semibold block">
                        Voice optimized for Chrome/Edge; type response below in other browsers
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isListening
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{isListening ? 'Listening (Click to Stop)' : 'Speak with Microphone'}</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="State your technical reasoning clearly. Provide concrete algorithms, architecture trade-offs, or real project experiences..."
                  className="input resize-none font-medium leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    {answerText.trim() ? `${answerText.trim().split(/\s+/).length} words spoken/typed` : 'Use microphone or keyboard'}
                  </span>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !answerText.trim()}
                    className="btn-primary bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{evaluating ? 'Evaluating NLP Rubric...' : 'Submit Response'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Scorecard Modal / View */}
      {isCompleted && finalScorecard && (
        <div className="card max-w-2xl mx-auto shadow-sm text-center border-2 border-emerald-300 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Interview Simulation Completed
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Evaluated by the NLP Rubric Engine across Technical Depth, Architectural Trade-offs, and Communication Clarity.
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

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-900 leading-relaxed mb-6 font-medium">
            <strong className="block text-slate-900 font-black uppercase tracking-wider mb-1.5 text-xs">
              Qualitative AI Diagnostic Synthesis:
            </strong>
            {finalScorecard.feedback}
          </div>

          <button
            onClick={() => {
              setActiveSession(null);
              setIsCompleted(false);
              setFinalScorecard(null);
            }}
            className="btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-6 font-bold text-xs"
          >
            Start Another Simulation
          </button>
        </div>
      )}

      {/* Past Mock Interview Records */}
      {sessions.length > 0 && !activeSession && (
        <section className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <History className="w-5 h-5 text-blue-600 stroke-[2.2]" />
            <h2 className="text-base font-bold text-slate-900">
              Past Mock Interview Records
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-blue text-xs font-bold uppercase">{sess.interviewType}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{sess.targetRole}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{sess.feedback}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-slate-900">
                      {sess.overallScore}%
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      Overall Score
                    </span>
                  </div>

                  <button
                    onClick={() => handleViewSessionDetails(sess.id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Transcript</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transcript Review Modal */}
      {selectedHistorySession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="badge-blue text-xs font-bold uppercase">
                  {selectedHistorySession.session.interviewType}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {selectedHistorySession.session.targetRole} — Transcript Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedHistorySession(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-around text-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Overall</span>
                  <span className="text-2xl font-black font-mono text-slate-900">{selectedHistorySession.session.overallScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Technical</span>
                  <span className="text-2xl font-black font-mono text-emerald-700">{selectedHistorySession.session.technicalScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Communication</span>
                  <span className="text-2xl font-black font-mono text-blue-700">{selectedHistorySession.session.communicationScore}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedHistorySession.turns.map((turn, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <p className="text-xs font-bold text-slate-900">
                      <span className="text-blue-600 uppercase font-black mr-1">Q{i + 1}:</span>
                      {turn.question?.questionText}
                    </p>
                    <p className="text-xs text-slate-700 pl-4 border-l-2 border-slate-200">
                      {turn.response?.responseText || 'No response recorded'}
                    </p>
                    {turn.response?.aiFeedback && (
                      <p className="text-[11px] text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-100 font-medium">
                        <strong>Feedback:</strong> {turn.response.aiFeedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedHistorySession(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
