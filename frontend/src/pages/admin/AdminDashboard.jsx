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
  Sparkles,
  FolderPlus,
  AlertCircle,
  Edit3,
  Clock,
  Layers,
  Award,
  BookOpen,
  Check,
  Briefcase,
  HelpCircle,
  Target
} from 'lucide-react';

const ALL_BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'CHE', name: 'Chemical Engineering' },
  { code: 'MME', name: 'Metallurgical & Materials' }
];

const ALL_YEARS = [
  { year: 1, label: 'E1 (1st Year)' },
  { year: 2, label: 'E2 (2nd Year)' },
  { year: 3, label: 'E3 (3rd Year)' },
  { year: 4, label: 'E4 (Final Year)' }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('ASSIGNMENTS'); // ASSIGNMENTS | QUESTIONS | USERS | STATS
  const [loading, setLoading] = useState(true);

  // Search & Filtering State
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Question Expand & Action State
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Question Modal State (Add or Edit)
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    testCategoryId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: '',
    difficulty: 'MEDIUM',
    topic: '',
    marks: 1,
    negativeMarks: 0.25
  });
  const [submittingQ, setSubmittingQ] = useState(false);
  const [questionError, setQuestionError] = useState('');

  // Assignment / Category Modal State (Create or Edit)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'MOCK', // MOCK, TECHNICAL, ASSIGNMENT, COMMON
    domain: 'Computer Science',
    description: '',
    durationMinutes: 30,
    passingPercentage: 60.0,
    targetYears: [], // e.g. [1, 2, 3, 4]
    targetDepartments: [], // e.g. ["CSE", "ECE"]
    isActive: true
  });
  const [submittingCat, setSubmittingCat] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const loadData = async () => {
    try {
      const [statsRes, usersRes, questionsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/questions'),
        api.get('/admin/categories').catch(() => api.get('/assessments/categories'))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setQuestions(questionsRes.data || []);
      setCategories(catRes.data || []);
      if (catRes.data && catRes.data.length > 0 && !questionForm.testCategoryId) {
        setQuestionForm((prev) => ({ ...prev, testCategoryId: catRes.data[0].id }));
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

  // Open Question Modal for a specific category
  const openAddQuestionForCategory = (catId) => {
    setEditingQuestionId(null);
    setQuestionError('');
    setQuestionForm({
      testCategoryId: catId,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: '',
      difficulty: 'MEDIUM',
      topic: '',
      marks: 1,
      negativeMarks: 0.25
    });
    setShowQuestionModal(true);
  };

  // Open Edit Question Modal
  const openEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionError('');
    const opts = q.options || [];
    setQuestionForm({
      testCategoryId: q.testCategoryId || q.category?.id || '',
      questionText: q.questionText || '',
      optionA: opts[0] || '',
      optionB: opts[1] || '',
      optionC: opts[2] || '',
      optionD: opts[3] || '',
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
      topic: q.topic || '',
      marks: q.marks ?? 1,
      negativeMarks: q.negativeMarks ?? 0.25
    });
    setShowQuestionModal(true);
  };

  // Open Category Modal (Create or Edit)
  const openCreateCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryError('');
    setCategoryForm({
      name: '',
      type: 'MOCK',
      domain: 'Computer Science',
      description: '',
      durationMinutes: 30,
      passingPercentage: 60.0,
      targetYears: [], // empty means all
      targetDepartments: [], // empty means all
      isActive: true
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryError('');

    let years = [];
    if (Array.isArray(cat.targetYearsList)) {
      years = cat.targetYearsList.map((y) => Number(String(y).replace(/[^0-9]/g, ''))).filter(Boolean);
    } else if (typeof cat.targetYears === 'string') {
      try {
        const parsed = JSON.parse(cat.targetYears);
        years = Array.isArray(parsed) ? parsed.map((y) => Number(String(y).replace(/[^0-9]/g, ''))).filter(Boolean) : [];
      } catch (e) {
        years = [];
      }
    }

    let depts = [];
    if (Array.isArray(cat.targetDepartmentsList)) {
      depts = cat.targetDepartmentsList;
    } else if (typeof cat.targetDepartments === 'string') {
      try {
        const parsed = JSON.parse(cat.targetDepartments);
        depts = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        depts = [];
      }
    }

    setCategoryForm({
      name: cat.name || '',
      type: cat.type || 'TECHNICAL',
      domain: cat.domain || 'Computer Science',
      description: cat.description || '',
      durationMinutes: cat.durationMinutes ?? 30,
      passingPercentage: cat.passingPercentage ?? 60.0,
      targetYears: years,
      targetDepartments: depts,
      isActive: cat.isActive !== false
    });
    setShowCategoryModal(true);
  };

  // Handle Question Save (Create or Update)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setQuestionError('');

    if (!questionForm.testCategoryId || !questionForm.questionText.trim()) {
      setQuestionError('Please select a target assignment category and provide the question text.');
      return;
    }

    const options = [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD].filter(Boolean);
    if (options.length < 2) {
      setQuestionError('Please provide at least 2 distinct answer options.');
      return;
    }

    if (!questionForm.correctAnswer) {
      setQuestionError('Please designate which option is the correct answer.');
      return;
    }

    setSubmittingQ(true);
    try {
      const payload = {
        testCategoryId: questionForm.testCategoryId,
        questionText: questionForm.questionText.trim(),
        options,
        correctAnswer: questionForm.correctAnswer,
        explanation: questionForm.explanation.trim(),
        difficulty: questionForm.difficulty,
        topic: questionForm.topic.trim(),
        marks: Number(questionForm.marks),
        negativeMarks: Number(questionForm.negativeMarks)
      };

      if (editingQuestionId) {
        await api.put(`/admin/questions/${editingQuestionId}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }

      setShowQuestionModal(false);
      await loadData();
    } catch (err) {
      setQuestionError(err.response?.data?.error || err.message);
    } finally {
      setSubmittingQ(false);
    }
  };

  // Handle Category Save (Create or Update)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');

    if (!categoryForm.name.trim()) {
      setCategoryError('Please enter an assignment / test suite title.');
      return;
    }

    setSubmittingCat(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        domain: categoryForm.domain.trim(),
        description: categoryForm.description.trim(),
        durationMinutes: Number(categoryForm.durationMinutes) || 30,
        passingPercentage: Number(categoryForm.passingPercentage) || 60.0,
        targetYears: categoryForm.targetYears,
        targetDepartments: categoryForm.targetDepartments,
        isActive: categoryForm.isActive
      };

      if (editingCategoryId) {
        await api.put(`/admin/categories/${editingCategoryId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }

      setShowCategoryModal(false);
      await loadData();
    } catch (err) {
      setCategoryError('Failed saving assignment suite: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingCat(false);
    }
  };

  // Delete Question
  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      await api.delete(`/admin/questions/${questionToDelete.id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
      if (stats) setStats({ ...stats, questions: Math.max(0, (stats.questions || 1) - 1) });
      setQuestionToDelete(null);
      await loadData();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Delete Category
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/admin/categories/${categoryToDelete.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      await loadData();
    } catch (err) {
      alert('Failed deleting assignment: ' + (err.response?.data?.error || err.message));
    }
  };

  // Toggle Year Selection in Category Form
  const toggleYearSelection = (yearNum) => {
    setCategoryForm((prev) => {
      const exists = prev.targetYears.includes(yearNum);
      return {
        ...prev,
        targetYears: exists ? prev.targetYears.filter((y) => y !== yearNum) : [...prev.targetYears, yearNum]
      };
    });
  };

  // Toggle Department Selection in Category Form
  const toggleDeptSelection = (deptCode) => {
    setCategoryForm((prev) => {
      const exists = prev.targetDepartments.includes(deptCode);
      return {
        ...prev,
        targetDepartments: exists
          ? prev.targetDepartments.filter((d) => d !== deptCode)
          : [...prev.targetDepartments, deptCode]
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Governance & Assessment Portal...</p>
        </div>
      </div>
    );
  }

  // Filtered Assignments
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      c.domain?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesType = assignmentTypeFilter === 'ALL' ? true : c.type === assignmentTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCatFilter ? (q.testCategoryId === selectedCatFilter || q.category?.id === selectedCatFilter) : true;
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Assessment & Question Bank Command Center</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Assessment Engine Online</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Curate Assessments, Practice Tests & Question Repositories
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Create custom assignments (e.g. Java Mock Assessment) calibrated to specific student batches and departments,
            and seamlessly seed questions for active test-taking and future student practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={openCreateCategoryModal}
            className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Assignment / Suite</span>
          </button>

          <button
            onClick={() => openAddQuestionForCategory(categories[0]?.id || '')}
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Aggregate Platform Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Assignments</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{categories.length}</span>
          <span className="text-[11px] font-semibold text-blue-700 mt-1 inline-block">Active Tracks</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Bank</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{questions.length}</span>
          <span className="text-[11px] font-semibold text-indigo-700 mt-1 inline-block">Practice Pool</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Students</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.students ?? 0}</span>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-block">Enrolled Cohort</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">TPO Officers</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.officers ?? 0}</span>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-block">Authorized</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Recruiters</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.companies ?? 0}</span>
          <span className="text-[11px] font-semibold text-amber-700 mt-1 inline-block">Corporate Partners</span>
        </div>

        <div className="card p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-2">
            <FileCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Applications</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.applications ?? 0}</span>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 inline-block">Submitted</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'ASSIGNMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Assessments & Assignments</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'QUESTIONS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question Bank Curator</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'USERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & RBAC</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('STATS')}
          className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'STATS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Health & Overview</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ASSIGNMENTS & ASSESSMENTS MANAGER                 */}
      {/* ========================================================= */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search assignments by title, domain, or target branches..."
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={assignmentTypeFilter}
                onChange={(e) => setAssignmentTypeFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
              >
                <option value="ALL">All Test Types</option>
                <option value="MOCK">Mock Assessments</option>
                <option value="TECHNICAL">Technical Engineering</option>
                <option value="ASSIGNMENT">Custom Assignments</option>
                <option value="COMMON">Common Foundational</option>
              </select>

              <button
                onClick={openCreateCategoryModal}
                className="btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 font-bold shrink-0 cursor-pointer shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>

          {/* Assignment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-800">No Assessment Suites Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {assignmentSearch || assignmentTypeFilter !== 'ALL'
                    ? 'No assignments match your search or type filter.'
                    : 'Click "Create Assignment" to launch a new targeted assessment or mock test.'}
                </p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const qCount = questions.filter((q) => q.testCategoryId === cat.id || q.category?.id === cat.id).length;

                // Parse target years
                let targetYearsArr = [];
                if (Array.isArray(cat.targetYearsList)) {
                  targetYearsArr = cat.targetYearsList;
                } else if (typeof cat.targetYears === 'string') {
                  try {
                    const parsed = JSON.parse(cat.targetYears);
                    targetYearsArr = Array.isArray(parsed) ? parsed : [];
                  } catch (e) {
                    targetYearsArr = [];
                  }
                }

                // Parse target departments
                let targetDeptsArr = [];
                if (Array.isArray(cat.targetDepartmentsList)) {
                  targetDeptsArr = cat.targetDepartmentsList;
                } else if (typeof cat.targetDepartments === 'string') {
                  try {
                    const parsed = JSON.parse(cat.targetDepartments);
                    targetDeptsArr = Array.isArray(parsed) ? parsed : [];
                  } catch (e) {
                    targetDeptsArr = [];
                  }
                }

                return (
                  <div
                    key={cat.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with Type & Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                                cat.type === 'MOCK'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : cat.type === 'ASSIGNMENT'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : cat.type === 'COMMON'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {cat.type || 'TECHNICAL'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {cat.domain || 'All Domains'}
                            </span>
                            {cat.isActive === false && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                Inactive
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit assignment settings"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {cat.description || 'Custom institutional assessment suite for skill calibration and practice.'}
                      </p>

                      {/* Targeting Badges */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                            <span>Target Batches (Years):</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {targetYearsArr.length === 0 ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                All Batches (E1 - E4)
                              </span>
                            ) : (
                              <span className="flex flex-wrap gap-1">
                                {targetYearsArr.map((y, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[11px]">
                                    E{String(y).replace(/[^0-9]/g, '')}
                                  </span>
                                ))}
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Target Branches:</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {targetDeptsArr.length === 0 ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                All Branches
                              </span>
                            ) : (
                              <span className="flex flex-wrap gap-1">
                                {targetDeptsArr.map((d, idx) => (
                                  <span key={idx} className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[11px]">
                                    {d}
                                  </span>
                                ))}
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Duration: <strong>{cat.durationMinutes || 30} mins</strong></span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-slate-400" />
                            <span>Pass Mark: <strong>{cat.passingPercentage || 60}%</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{qCount} Questions in Bank</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCatFilter(cat.id);
                            setActiveTab('QUESTIONS');
                          }}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View Questions
                        </button>

                        <button
                          onClick={() => openAddQuestionForCategory(cat.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Questions</span>
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

      {/* ========================================================= */}
      {/* TAB 2: QUESTION BANK CURATOR                             */}
      {/* ========================================================= */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search questions by text, explanation, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
              >
                <option value="">All Assignments ({categories.length})</option>
                {categories.map((c) => {
                  const cCount = questions.filter((q) => q.testCategoryId === c.id || q.category?.id === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({cCount} Qs)
                    </option>
                  );
                })}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <button
                onClick={() => openAddQuestionForCategory(selectedCatFilter || categories[0]?.id || '')}
                className="btn-primary text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5 font-bold shrink-0 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-8">
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
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedQuestionId === q.id;
                const cat = categories.find((c) => c.id === (q.testCategoryId || q.category?.id)) || q.category;

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="badge-blue text-xs font-bold">{cat?.name || 'General'}</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
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
                          <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                            +{q.marks} / -{q.negativeMarks} marks
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                          {q.questionText}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct: <strong>{q.correctAnswer}</strong></span>
                          </span>

                          <button
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            className="text-xs text-gray-600 hover:text-gray-900 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Options & Explanation' : `View Options (${q.options?.length || 0}) & Explanation`}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Collapsible Options Drawer */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options?.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`text-xs px-3 py-2 rounded-xl border flex items-center justify-between ${
                                    opt === q.correctAnswer
                                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                                      : 'bg-gray-50 border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {opt === q.correctAnswer && (
                                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                      Correct Choice
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Explanation Card */}
                            {q.explanation && (
                              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl text-xs text-slate-700">
                                <span className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Rationale & Solution Explanation:</span>
                                </span>
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setQuestionToDelete(q)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* ========================================================= */}
      {/* TAB 3: USER ACCOUNTS & RBAC                              */}
      {/* ========================================================= */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* User Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search users by name or institutional email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
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
          <div className="card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">User Identifier</th>
                    <th className="py-3 px-4">Entity Profile Name</th>
                    <th className="py-3 px-4">Department / Affiliation</th>
                    <th className="py-3 px-4">Academic Year / Batch</th>
                    <th className="py-3 px-4">Assigned RBAC Role</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
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
                      const yearOfStudy = u.student?.yearOfStudy || u.student?.year ? `Year ${u.student.year}` : 'N/A';

                      return (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-gray-900 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.email}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-800">{name}</td>
                          <td className="py-3 px-4 text-gray-600">{affiliation}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {u.role === 'STUDENT' ? (
                              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {yearOfStudy}
                              </span>
                            ) : (
                              'Staff / Enterprise'
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
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
                          <td className="py-3 px-4 text-emerald-600 font-bold inline-flex items-center gap-1">
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

      {/* ========================================================= */}
      {/* TAB 4: SYSTEM HEALTH & OVERVIEW                         */}
      {/* ========================================================= */}
      {activeTab === 'STATS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
              <Server className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                System Infrastructure Status
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">Backend Framework</span>
                <span className="font-mono font-bold text-slate-900">Spring Boot 3.3.4 (Java 21)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">Persistent Storage Engine</span>
                <span className="font-mono font-bold text-emerald-700">PostgreSQL Relational DB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">Authentication & Security</span>
                <span className="font-mono font-bold text-slate-900">Stateless JWT + RBAC Guards</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">Evaluation Engine</span>
                <span className="font-mono font-bold text-slate-900">Stratified Random Sampling + Live Scoring</span>
              </div>
            </div>
          </div>

          <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Test Category Repositories
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{categories.length} Active Tracks</span>
                <button
                  onClick={openCreateCategoryModal}
                  className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Suite</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = questions.filter((q) => q.testCategoryId === cat.id || q.category?.id === cat.id).length;
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
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {count} {count === 1 ? 'question' : 'questions'}
                      </span>
                      <span className="badge-blue text-xs font-bold">{cat.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT QUESTION                                */}
      {/* ========================================================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {editingQuestionId ? 'Edit Assessment Question' : 'Add Question to Repository'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define multi-choice question, designated correct answer, and explanation for student practice review.
                </p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {questionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{questionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Target Assignment / Test Category *
                </label>
                <select
                  required
                  value={questionForm.testCategoryId}
                  onChange={(e) => setQuestionForm({ ...questionForm, testCategoryId: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} • {c.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Question Text / Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="e.g. In Java, what is the default capacity of an ArrayList when it is created without specifying an initial capacity?"
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Options & Correct Answer Selection *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'optionA', label: 'Option A' },
                    { key: 'optionB', label: 'Option B' },
                    { key: 'optionC', label: 'Option C' },
                    { key: 'optionD', label: 'Option D' }
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">{label}</span>
                        {questionForm[key] && (
                          <label className="inline-flex items-center gap-1 cursor-pointer text-xs font-bold text-blue-600">
                            <input
                              type="radio"
                              name="correctAnswerSelect"
                              checked={questionForm.correctAnswer === questionForm[key]}
                              onChange={() => setQuestionForm({ ...questionForm, correctAnswer: questionForm[key] })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Mark Correct</span>
                          </label>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={questionForm[key]}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionForm((prev) => ({
                            ...prev,
                            [key]: val,
                            correctAnswer: prev.correctAnswer === prev[key] ? val : prev.correctAnswer
                          }));
                        }}
                        className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {questionForm.correctAnswer && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Designated Correct Answer: <strong className="underline">{questionForm.correctAnswer}</strong></span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Explanation / Solution Rationale (Shown upon student review)
                </label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="e.g. When an ArrayList is instantiated using the default constructor ArrayList(), an empty array is initially allocated. Upon adding the first element, the capacity is expanded to 10."
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Topic / Tag</label>
                  <input
                    type="text"
                    value={questionForm.topic}
                    placeholder="e.g. Collections Framework"
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Marks (+ / -)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={questionForm.marks}
                      onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                      className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                    <input
                      type="number"
                      step="0.25"
                      value={questionForm.negativeMarks}
                      onChange={(e) => setQuestionForm({ ...questionForm, negativeMarks: e.target.value })}
                      className="w-1/2 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-rose-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQ}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {submittingQ ? 'Saving Question...' : editingQuestionId ? 'Update Question' : 'Save to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT ASSIGNMENT SUITE                     */}
      {/* ========================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    {editingCategoryId ? 'Edit Assignment Settings' : 'Create Assignment / Mock Assessment'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Define test parameters and restrict visibility by student batch year and branch.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assignment Title *
                </label>
                <input
                  required
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Java Mock Assessment, Full Stack Spring Boot Architecture"
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={categoryForm.type}
                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer"
                  >
                    <option value="MOCK">MOCK (Mock Assessment / Interview Prep)</option>
                    <option value="ASSIGNMENT">ASSIGNMENT (Department Assignment)</option>
                    <option value="TECHNICAL">TECHNICAL (Core Engineering / Code)</option>
                    <option value="COMMON">COMMON (Verbal / Logical / Aptitude)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Domain / Subject
                  </label>
                  <input
                    type="text"
                    value={categoryForm.domain}
                    onChange={(e) => setCategoryForm({ ...categoryForm, domain: e.target.value })}
                    placeholder="e.g. Java Full Stack, Python, Web Dev"
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Target Academic Batches (Years) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Target Academic Years / Batches
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryForm((prev) => ({ ...prev, targetYears: [] }))}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Open to All Batches
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_YEARS.map(({ year, label }) => {
                    const isSelected = categoryForm.targetYears.includes(year);
                    return (
                      <button
                        type="button"
                        key={year}
                        onClick={() => toggleYearSelection(year)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
                {categoryForm.targetYears.length === 0 && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Currently visible to students across all batch years (E1 to E4).
                  </p>
                )}
              </div>

              {/* Target Departments / Branches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Target Branches / Departments
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryForm((prev) => ({ ...prev, targetDepartments: [] }))}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Open to All Branches
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ALL_BRANCHES.map(({ code }) => {
                    const isSelected = categoryForm.targetDepartments.includes(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => toggleDeptSelection(code)}
                        className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
                {categoryForm.targetDepartments.length === 0 && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Currently visible to students across all engineering branches.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={categoryForm.durationMinutes}
                    onChange={(e) => setCategoryForm({ ...categoryForm, durationMinutes: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={categoryForm.passingPercentage}
                    onChange={(e) => setCategoryForm({ ...categoryForm, passingPercentage: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description / Instructions for Students
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="e.g. Evaluates object-oriented programming, Spring Boot microservices, JPA/Hibernate, and concurrency."
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-normal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {submittingCat ? 'Saving Assignment...' : editingCategoryId ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE QUESTION CONFIRMATION                       */}
      {/* ========================================================= */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Delete Question?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently remove this question from the active assessment repository?
              </p>
              <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 text-left line-clamp-2 italic font-mono">
                "{questionToDelete.questionText}"
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE ASSIGNMENT CONFIRMATION                     */}
      {/* ========================================================= */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Delete Assignment Suite?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will permanently remove <strong>{categoryToDelete.name}</strong> and all questions linked to it.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
