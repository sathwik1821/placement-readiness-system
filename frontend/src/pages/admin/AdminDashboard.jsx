import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminAssignmentsTab from './components/AdminAssignmentsTab';
import AdminQuestionsTab from './components/AdminQuestionsTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminStatsTab from './components/AdminStatsTab';
import AdminQuestionModal from './components/AdminQuestionModal';
import AdminCategoryModal from './components/AdminCategoryModal';
import AdminDeleteConfirmModal from './components/AdminDeleteConfirmModal';
import {
  Users,
  GraduationCap,
  Building2,
  ClipboardList,
  ShieldCheck,
  Server,
  FolderPlus,
  Layers,
  Sparkles
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
    type: 'MOCK',
    domain: 'Computer Science',
    description: '',
    durationMinutes: 30,
    passingPercentage: 60.0,
    targetYears: [],
    targetDepartments: [],
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
      targetYears: [],
      targetDepartments: [],
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

  const toggleYearSelection = (yearNum) => {
    setCategoryForm((prev) => {
      const exists = prev.targetYears.includes(yearNum);
      return {
        ...prev,
        targetYears: exists ? prev.targetYears.filter((y) => y !== yearNum) : [...prev.targetYears, yearNum]
      };
    });
  };

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      !assignmentSearch ||
      c.name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      c.domain?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (typeof c.targetDepartments === 'string' && c.targetDepartments.toLowerCase().includes(assignmentSearch.toLowerCase()));
    const matchesType = assignmentTypeFilter === 'ALL' || c.type === assignmentTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filter Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesCategory =
      !selectedCatFilter || q.testCategoryId === selectedCatFilter || q.category?.id === selectedCatFilter;
    const matchesDifficulty = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;
    const matchesSearch =
      !searchQuery ||
      q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const name = u.student?.name || u.placementOfficer?.name || u.company?.companyName || '';
    const matchesSearch =
      !userSearch ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      name.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Institutional Administration & Governance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage practice assignments, calibrate question repositories, and monitor campus placement operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateCategoryModal}
            className="btn-primary text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.users ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Registered Students', value: stats?.students ?? 0, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Recruitment Drives', value: stats?.drives ?? 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Assessment Questions', value: questions.length, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="card bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 font-mono">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 space-x-1 sm:space-x-3 text-xs sm:text-sm font-bold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ASSIGNMENTS'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Assignments & Mock Suites ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'QUESTIONS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Question Bank ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'USERS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STATS')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'STATS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Health & Overview</span>
        </button>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === 'ASSIGNMENTS' && (
        <AdminAssignmentsTab
          categories={categories}
          filteredCategories={filteredCategories}
          questions={questions}
          assignmentSearch={assignmentSearch}
          setAssignmentSearch={setAssignmentSearch}
          assignmentTypeFilter={assignmentTypeFilter}
          setAssignmentTypeFilter={setAssignmentTypeFilter}
          openCreateCategoryModal={openCreateCategoryModal}
          openEditCategoryModal={openEditCategoryModal}
          setCategoryToDelete={setCategoryToDelete}
          setSelectedCatFilter={setSelectedCatFilter}
          setActiveTab={setActiveTab}
          openAddQuestionForCategory={openAddQuestionForCategory}
        />
      )}

      {/* Tab 2: Questions */}
      {activeTab === 'QUESTIONS' && (
        <AdminQuestionsTab
          questions={questions}
          filteredQuestions={filteredQuestions}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCatFilter={selectedCatFilter}
          setSelectedCatFilter={setSelectedCatFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          openAddQuestionForCategory={openAddQuestionForCategory}
          openEditQuestion={openEditQuestion}
          setQuestionToDelete={setQuestionToDelete}
          expandedQuestionId={expandedQuestionId}
          setExpandedQuestionId={setExpandedQuestionId}
        />
      )}

      {/* Tab 3: Users */}
      {activeTab === 'USERS' && (
        <AdminUsersTab
          users={users}
          filteredUsers={filteredUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          userRoleFilter={userRoleFilter}
          setUserRoleFilter={setUserRoleFilter}
        />
      )}

      {/* Tab 4: System Stats */}
      {activeTab === 'STATS' && (
        <AdminStatsTab
          categories={categories}
          questions={questions}
          openCreateCategoryModal={openCreateCategoryModal}
        />
      )}

      {/* Question Modal */}
      <AdminQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        editingQuestionId={editingQuestionId}
        questionForm={questionForm}
        setQuestionForm={setQuestionForm}
        categories={categories}
        questionError={questionError}
        submittingQ={submittingQ}
        onSave={handleSaveQuestion}
      />

      {/* Category Modal */}
      <AdminCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        editingCategoryId={editingCategoryId}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        categoryError={categoryError}
        submittingCat={submittingCat}
        onSave={handleSaveCategory}
        toggleYearSelection={toggleYearSelection}
        toggleDeptSelection={toggleDeptSelection}
        allYears={ALL_YEARS}
        allBranches={ALL_BRANCHES}
      />

      {/* Delete Question Confirmation */}
      <AdminDeleteConfirmModal
        item={questionToDelete}
        type="question"
        onConfirm={confirmDeleteQuestion}
        onCancel={() => setQuestionToDelete(null)}
      />

      {/* Delete Category Confirmation */}
      <AdminDeleteConfirmModal
        item={categoryToDelete}
        type="category"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
