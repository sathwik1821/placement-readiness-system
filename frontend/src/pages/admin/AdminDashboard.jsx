import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Users,
  GraduationCap,
  Building2,
  ClipboardList,
  ShieldCheck,
  PlusCircle,
  Trash2,
  FileCheck,
  X,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Server,
  Database,
  KeyRound,
  Sparkles,
  FolderPlus,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('STATS'); // STATS | QUESTIONS | USERS
  const [loading, setLoading] = useState(true);

  // Question Management State
  const [showAddModal, setShowAddModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Question Creation Form State
  const [newQuestion, setNewQuestion] = useState({
    testCategoryId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    difficulty: 'MEDIUM',
    topic: '',
    marks: 1,
    negativeMarks: 0.25
  });
  const [submittingQ, setSubmittingQ] = useState(false);
  const [formError, setFormError] = useState('');

  // Assessment Suite Creation State
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'TECHNICAL',
    department: 'Computer Science',
    description: ''
  });
  const [submittingCat, setSubmittingCat] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    if (!newCategory.name.trim()) {
      setCategoryError('Please enter a test suite title.');
      return;
    }
    setSubmittingCat(true);
    try {
      const res = await api.post('/admin/categories', newCategory);
      setCategories((prev) => [...prev, res.data]);
      setShowCreateCategoryModal(false);
      setNewCategory({
        name: '',
        type: 'TECHNICAL',
        department: 'Computer Science',
        description: ''
      });
      alert('New assessment suite created successfully!');
    } catch (err) {
      setCategoryError('Failed creating suite: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingCat(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, questionsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/questions'),
        api.get('/assessments/categories').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setQuestions(questionsRes.data || []);
      setCategories(catRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        setNewQuestion((prev) => ({ ...prev, testCategoryId: catRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      await api.delete(`/admin/questions/${questionToDelete.id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
      if (stats) setStats({ ...stats, questions: Math.max(0, (stats.questions || 1) - 1) });
      setQuestionToDelete(null);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newQuestion.testCategoryId || !newQuestion.questionText.trim()) {
      setFormError('Please select a category and provide the question text.');
      return;
    }

    const options = [newQuestion.optionA, newQuestion.optionB, newQuestion.optionC, newQuestion.optionD].filter(Boolean);
    if (options.length < 2) {
      setFormError('Please provide at least 2 distinct answer options.');
      return;
    }

    if (!newQuestion.correctAnswer) {
      setFormError('Please designate which option is the correct answer.');
      return;
    }

    setSubmittingQ(true);
    try {
      await api.post('/admin/questions', {
        testCategoryId: newQuestion.testCategoryId,
        questionText: newQuestion.questionText.trim(),
        options,
        correctAnswer: newQuestion.correctAnswer,
        difficulty: newQuestion.difficulty,
        topic: newQuestion.topic.trim(),
        marks: Number(newQuestion.marks),
        negativeMarks: Number(newQuestion.negativeMarks)
      });
      setShowAddModal(false);
      setNewQuestion({
        testCategoryId: categories[0]?.id || '',
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        difficulty: 'MEDIUM',
        topic: '',
        marks: 1,
        negativeMarks: 0.25
      });
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setSubmittingQ(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Governance Console...</p>
        </div>
      </div>
    );
  }

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCatFilter ? q.category?.id === selectedCatFilter : true;
    const matchesDifficulty = difficultyFilter === 'ALL' ? true : q.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const name =
      u.student?.name ||
      u.placementOfficer?.name ||
      u.company?.companyName ||
      'System Administrator';
    const matchesSearch =
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      name.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' ? true : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Top Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Root Governance Console</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Cluster Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Administration & Assessment Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage institutional users, monitor campus drive pipelines, and curate domain questions powering real-time readiness scores.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="btn-primary bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl shrink-0 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Assessment Question</span>
        </button>
      </div>

      {/* Aggregate Platform Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Students</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.students ?? 0}</span>
          <span className="text-[11px] font-medium text-emerald-700 mt-1 inline-block">Active Cohort</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">TPO Officers</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.officers ?? 0}</span>
          <span className="text-[11px] font-medium text-emerald-700 mt-1 inline-block">Authorized</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Recruiters</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.companies ?? 0}</span>
          <span className="text-[11px] font-medium text-blue-700 mt-1 inline-block">Verified Partners</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Campus Drives</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.drives ?? 0}</span>
          <span className="text-[11px] font-medium text-amber-700 mt-1 inline-block">In Recruitment</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-2">
            <FileCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Applications</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.applications ?? 0}</span>
          <span className="text-[11px] font-medium text-slate-600 mt-1 inline-block">Submitted</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Question Bank</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats?.questions ?? 0}</span>
          <span className="text-[11px] font-medium text-blue-700 mt-1 inline-block">Curated Items</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab('STATS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'STATS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          System Health & Overview
        </button>
        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'QUESTIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Question Bank Management</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
            {questions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>User Accounts & RBAC</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
            {users.length}
          </span>
        </button>
      </div>

      {/* TAB 1: System Health & Overview */}
      {activeTab === 'STATS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
              <Server className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                System Infrastructure Status
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Backend Framework</span>
                <span className="font-mono font-bold text-slate-900">Spring Boot 3.3.4 (Java 21)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Persistent Storage Engine</span>
                <span className="font-mono font-bold text-emerald-700">Hibernate 6.5 + H2 File DB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Authentication & Security</span>
                <span className="font-mono font-bold text-slate-900">Stateless JWT + RBAC Guards</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Evaluation Engine</span>
                <span className="font-mono font-bold text-slate-900">Multi-Factor Calibrated Scoring</span>
              </div>
            </div>
          </div>

          <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Test Category Repositories
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{categories.length} Active Domains</span>
                <button
                  onClick={() => {
                    setCategoryError('');
                    setShowCreateCategoryModal(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Suite</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = questions.filter((q) => q.category?.id === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{cat.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{cat.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {count} {count === 1 ? 'question' : 'questions'}
                      </span>
                      <span className="badge-blue text-xs font-semibold">{cat.categoryType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Question Bank Management */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search questions, topics, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <button
                onClick={() => {
                  setCategoryError('');
                  setShowCreateCategoryModal(true);
                }}
                className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Suite</span>
              </button>

              <button
                onClick={() => {
                  setFormError('');
                  setShowAddModal(true);
                }}
                className="btn-primary text-xs py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200 p-8">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-800">No Assessment Questions Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCatFilter || difficultyFilter !== 'ALL'
                    ? 'No questions match your current search or category filter.'
                    : 'The question bank is currently empty. Click "Add Question" to seed technical questions.'}
                </p>
                {(searchQuery || selectedCatFilter || difficultyFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCatFilter('');
                      setDifficultyFilter('ALL');
                    }}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedQuestionId === q.id;
                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="badge-blue text-xs font-semibold">{q.category?.name}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              q.difficulty === 'EASY'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : q.difficulty === 'HARD'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          {q.topic && (
                            <span className="text-xs text-gray-500 font-medium">
                              Topic: <strong className="text-gray-700">{q.topic}</strong>
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                          {q.questionText}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct: <strong>{q.correctAnswer}</strong></span>
                          </span>

                          <button
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            className="text-xs text-gray-500 hover:text-gray-800 font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Options' : `View All Options (${q.options?.length || 0})`}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Collapsible Options Drawer */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options?.map((opt, i) => (
                              <div
                                key={i}
                                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center justify-between ${
                                  opt === q.correctAnswer
                                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                }`}
                              >
                                <span>{opt}</span>
                                {opt === q.correctAnswer && (
                                  <span className="text-[11px] font-bold text-emerald-700">Correct Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          +{q.marks} / -{q.negativeMarks}
                        </span>
                        <button
                          onClick={() => setQuestionToDelete(q)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete question permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: User Accounts & RBAC */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* User Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search users by name or institutional email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="STUDENT">Students</option>
                <option value="PLACEMENT_OFFICER">Placement Officers</option>
                <option value="COMPANY">Recruiters</option>
                <option value="ADMIN">System Admins</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="card bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">User Identifier</th>
                    <th className="py-3 px-4">Entity Profile Name</th>
                    <th className="py-3 px-4">Department / Affiliation</th>
                    <th className="py-3 px-4">Assigned RBAC Role</th>
                    <th className="py-3 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400 text-xs">
                        No user accounts match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const name =
                        u.student?.name ||
                        u.placementOfficer?.name ||
                        u.company?.companyName ||
                        'System Administrator';
                      const affiliation =
                        u.student?.department ||
                        u.placementOfficer?.department ||
                        u.company?.industry ||
                        'Platform Governance';

                      return (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-gray-900 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.email}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-800">{name}</td>
                          <td className="py-3 px-4 text-gray-500">{affiliation}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                                u.role === 'ADMIN'
                                  ? 'bg-slate-800 text-slate-100'
                                  : u.role === 'PLACEMENT_OFFICER'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.role === 'COMPANY'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-semibold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Styled Modal: Add New Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Test Question to Repository</h3>
                <p className="text-xs text-gray-500 mt-0.5">Define multi-choice questions and benchmark criteria.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Test Category
                </label>
                <select
                  required
                  value={newQuestion.testCategoryId}
                  onChange={(e) => setNewQuestion({ ...newQuestion, testCategoryId: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Question Text / Statement
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="e.g. What is the time complexity of quicksort in the worst case?"
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Options & Correct Answer Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'optionA', label: 'Option A' },
                    { key: 'optionB', label: 'Option B' },
                    { key: 'optionC', label: 'Option C' },
                    { key: 'optionD', label: 'Option D' }
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                        {newQuestion[key] && (
                          <label className="inline-flex items-center gap-1 cursor-pointer text-xs font-semibold text-blue-600">
                            <input
                              type="radio"
                              name="correctAnswerSelect"
                              checked={newQuestion.correctAnswer === newQuestion[key]}
                              onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: newQuestion[key] })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Mark Correct</span>
                          </label>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={newQuestion[key]}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewQuestion((prev) => ({
                            ...prev,
                            [key]: val,
                            // If this was marked correct, update correct answer string as well
                            correctAnswer: prev.correctAnswer === prev[key] ? val : prev.correctAnswer
                          }));
                        }}
                        className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {newQuestion.correctAnswer && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Designated Correct Answer: <strong>{newQuestion.correctAnswer}</strong></span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={newQuestion.topic}
                    placeholder="e.g. Asymptotics"
                    onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Marks (+ / -)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                      className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="number"
                      step="0.25"
                      value={newQuestion.negativeMarks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, negativeMarks: e.target.value })}
                      className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQ}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {submittingQ ? 'Saving Question...' : 'Save to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assessment Suite / Category */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Create Assessment Suite</h3>
                  <p className="text-xs text-gray-500">Add a new test track or company-specific assessment domain</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {categoryError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Suite / Track Name *
                </label>
                <input
                  required
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Java Spring Core, Verbal Reasoning, Amazon SDE-1 Assessment"
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Category Type
                  </label>
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="TECHNICAL">TECHNICAL (Core Engineering / Code)</option>
                    <option value="COMMON">COMMON (Verbal / Logical / Aptitude)</option>
                    <option value="COMPANY">COMPANY (Corporate Shortlisting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Target Domain / Dept
                  </label>
                  <input
                    type="text"
                    value={newCategory.department}
                    onChange={(e) => setNewCategory({ ...newCategory, department: e.target.value })}
                    placeholder="e.g. Computer Science, General, SDE"
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description / Syllabus Summary
                </label>
                <textarea
                  rows={2}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="e.g. Evaluates object-oriented programming, Spring Boot microservices, JPA/Hibernate, and concurrency."
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-normal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingCat ? 'Creating Suite...' : 'Create Assessment Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Confirmation Popover: Delete Question */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Question?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently remove this question from the active assessment repository?
              </p>
              <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 text-left line-clamp-2 italic font-mono">
                "{questionToDelete.questionText}"
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
