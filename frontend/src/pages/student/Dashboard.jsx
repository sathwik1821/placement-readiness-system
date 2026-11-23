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
      const [profRes, repRes, attRes, drvRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/analysis/report').catch(() => ({ data: null })),
        api.get('/assessments/attempts').catch(() => ({ data: [] })),
        api.get('/placement/drives').catch(() => ({ data: [] }))
      ]);
      setProfile(profRes.data);
      setReport(repRes.data);
      setAttempts(attRes.data || []);
      setDrives(drvRes.data || []);
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

  // Map category scores from completed attempts
  const categoryScores = {};
  attempts.forEach((att) => {
    if (att.category?.name) {
      const cur = categoryScores[att.category.name] || 0;
      if (att.percentageScore > cur) {
        categoryScores[att.category.name] = att.percentageScore;
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

  // Pre-configured sequential learning roadmaps by career track
  const careerRoadmaps = {
    'Java Full Stack Developer': [
      {
        step: 1,
        skillKey: 'OOP Concepts',
        title: 'Core Java & OOP Fundamentals',
        description: 'Establish foundational object-oriented design: inheritance, polymorphism, encapsulation, SOLID principles, and Java Collections Framework.',
        topics: ['Java Core Syntax', 'OOP Class Hierarchies', 'SOLID Design Principles', 'Collections & Generics', 'JVM Memory Model'],
        resourceHint: 'Refactoring Guru Design Patterns & Java Core Handbook',
        benchmark: 75
      },
      {
        step: 2,
        skillKey: 'Data Structures & Algorithms',
        title: 'Data Structures & Problem Solving (DSA)',
        description: 'Mandatory gateway for technical screening rounds: Arrays, HashMaps, Two-Pointers, Stacks/Queues, Trees, Graphs, and Dynamic Programming.',
        topics: ['Arrays & HashMaps', 'Two Pointers & Sliding Window', 'Binary Search & Trees', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming'],
        resourceHint: 'NeetCode 150 Coding Patterns & Striver SDE Sheet',
        benchmark: 75
      },
      {
        step: 3,
        skillKey: 'DBMS',
        title: 'Database Architecture & Persistence (SQL/JPA)',
        description: 'Relational data modeling, complex SQL joins, indexing, 3NF normalization, and transaction ACID guarantees.',
        topics: ['Relational Schema Design', 'Complex SQL Joins & Subqueries', '3NF Normalization', 'B-Tree Indexing Optimization', 'ACID Transactions'],
        resourceHint: 'Use The Index, Luke: SQL Indexing Guide & Mode SQL',
        benchmark: 75
      },
      {
        step: 4,
        skillKey: 'Java & Spring Boot',
        title: 'Enterprise Backend & Microservices',
        description: 'Build enterprise-grade REST APIs, dependency injection (@Autowired), Spring Data JPA repositories, and microservice architecture.',
        topics: ['Spring IoC & Dependency Injection', 'Spring Boot REST Controllers', 'Spring Data JPA & Hibernate', 'JWT Security & Auth', 'Microservices Architecture'],
        resourceHint: 'Baeldung Spring Boot Suite & Spring.io Guides',
        benchmark: 80
      },
      {
        step: 5,
        skillKey: 'Web Frontend & React',
        title: 'Modern Reactive Frontend (React 18)',
        description: 'Create responsive web user interfaces with React 18 component trees, hooks (useState, useEffect), and REST API integration.',
        topics: ['JSX & Component Lifecycles', 'React Hooks (useState, useEffect)', 'Axios REST API Integration', 'State Management & Context', 'Tailwind CSS UI'],
        resourceHint: 'React.dev Official Documentation & Full Stack Open',
        benchmark: 70
      },
      {
        step: 6,
        skillKey: 'Quantitative Aptitude',
        title: 'Campus Aptitude & Placement Agility',
        description: 'Crack campus recruitment round-1 qualifying cutoffs with speed mathematics, logical deductions, and analytical reasoning.',
        topics: ['Speed, Distance & Time', 'Percentages & Profit/Loss', 'Permutations & Probability', 'Logical Deductions', 'Pattern Analysis'],
        resourceHint: 'IndiaBIX Campus Placement Aptitude Suite',
        benchmark: 70
      }
    ],
    'MERN Full Stack Developer': [
      {
        step: 1,
        skillKey: 'OOP Concepts',
        title: 'JavaScript & Modern ES6+ Architecture',
        description: 'Asynchronous event-loop, Promises, async/await, closures, prototypes, and modular JavaScript design.',
        topics: ['ES6+ Syntaxes', 'Asynchronous Event Loop', 'Closures & Scopes', 'Prototypes & Classes', 'Modular Code Patterns'],
        resourceHint: 'JavaScript.info & Refactoring Guru Patterns',
        benchmark: 70
      },
      {
        step: 2,
        skillKey: 'Data Structures & Algorithms',
        title: 'Data Structures & Algorithmic Problem Solving',
        description: 'Interview coding fundamentals: Arrays, Linked Lists, Hash Tables, Recursion, Binary Trees, and Search/Sort algorithms.',
        topics: ['Linear Data Structures', 'Recursion & Backtracking', 'Binary Trees', 'Searching & Sorting', 'Complexity Analysis (Big-O)'],
        resourceHint: 'NeetCode 150 Roadmap & LeetCode Explore',
        benchmark: 70
      },
      {
        step: 3,
        skillKey: 'DBMS',
        title: 'Database Design & NoSQL Modeling (MongoDB/SQL)',
        description: 'Document modeling, schema validation, aggregation pipelines, indexing, and transactional consistency.',
        topics: ['MongoDB Documents & Schemas', 'Aggregation Pipelines', 'Index Tuning', 'Mongoose ORM Integration', 'Relational SQL Joins'],
        resourceHint: 'MongoDB University & Mode SQL Tutorial',
        benchmark: 75
      },
      {
        step: 4,
        skillKey: 'Node.js & Backend Architecture',
        title: 'Node.js & Express REST Backend',
        description: 'Build secure, asynchronous REST microservices using Express, JWT tokens, middleware chains, and MVC architecture.',
        topics: ['Express.js Routing & Middleware', 'JWT Authentication & Security', 'Asynchronous File/DB IO', 'REST API Best Practices', 'Error Handling'],
        resourceHint: 'Node.js Official Documentation & Express Handbook',
        benchmark: 80
      },
      {
        step: 5,
        skillKey: 'Web Frontend & React',
        title: 'Reactive Frontend Engineering with React',
        description: 'Single-page web applications with React 18, custom hooks, reactive state management, and modern CSS frameworks.',
        topics: ['React Component Architecture', 'Hooks (useState, useEffect, useMemo)', 'Axios REST Integration', 'Responsive UI & Tailwind', 'State Architecture'],
        resourceHint: 'React.dev Official Interactive Tutorials',
        benchmark: 85
      },
      {
        step: 6,
        skillKey: 'Logical Reasoning',
        title: 'Campus Aptitude & Cognitive Reasoning',
        description: 'Deductive reasoning, sequence puzzles, and quantitative problem-solving for campus recruitment screening.',
        topics: ['Logical Sequences', 'Syllogisms & Relations', 'Quantitative Mathematics', 'Critical Reasoning', 'Data Sufficiency'],
        resourceHint: 'IndiaBIX Logical Reasoning & Aptitude Suite',
        benchmark: 70
      }
    ],
    'AI / ML Engineer': [
      {
        step: 1,
        skillKey: 'OOP Concepts',
        title: 'Python Programming & Scientific Computing',
        description: 'Python 3 object-oriented design, vectorized computation with NumPy, and structured data handling with Pandas.',
        topics: ['Python 3 OOP', 'NumPy Vectorized Arrays', 'Pandas DataFrame Transformations', 'Matplotlib / Seaborn', 'Efficient Scripting'],
        resourceHint: 'Python Official Docs & Refactoring Guru',
        benchmark: 75
      },
      {
        step: 2,
        skillKey: 'Quantitative Aptitude',
        title: 'Applied Mathematics, Calculus & Probability',
        description: 'Mathematical foundations of machine learning: Probability distributions, Bayes theorem, linear algebra, and multivariable calculus.',
        topics: ['Probability & Bayes Theorem', 'Linear Algebra & Matrices', 'Calculus & Gradients', 'Descriptive Statistics', 'Hypothesis Testing'],
        resourceHint: 'Khan Academy Linear Algebra & IndiaBIX Aptitude',
        benchmark: 80
      },
      {
        step: 3,
        skillKey: 'Data Structures & Algorithms',
        title: 'Algorithmic Optimization & Complexity',
        description: 'Algorithm optimization (Big-O), memory limits, tree traversal, matrix manipulation, and graph search.',
        topics: ['Matrix Manipulations', 'Search & Optimization Algorithms', 'Trees & Graph Traversal', 'Recursion & Dynamic Programming'],
        resourceHint: 'NeetCode 150 Coding Patterns & LeetCode',
        benchmark: 75
      },
      {
        step: 4,
        skillKey: 'DBMS',
        title: 'Data Warehousing & SQL Query Engineering',
        description: 'SQL aggregations, CTEs, feature store data extraction, and relational schema management.',
        topics: ['Analytical SQL Aggregations', 'CTEs & Subqueries', 'Feature Store Extraction', 'Database Normalization', 'Data Cleansing'],
        resourceHint: 'Mode SQL Analytics & PostgreSQL Exercises',
        benchmark: 70
      },
      {
        step: 5,
        skillKey: 'Machine Learning & Python',
        title: 'Machine Learning & Neural Architectures',
        description: 'Supervised & unsupervised models, Scikit-Learn pipelines, cross-validation, loss functions, and deep neural network fundamentals.',
        topics: ['Regression & Classification Models', 'Scikit-Learn ML Pipelines', 'Hyperparameter Tuning & Cross-Val', 'Neural Networks & Loss Functions', 'Evaluation Metrics (F1, ROC-AUC)'],
        resourceHint: 'Fast.ai Practical Deep Learning & Kaggle Learn',
        benchmark: 85
      },
      {
        step: 6,
        skillKey: 'Logical Reasoning',
        title: 'Cognitive Deduction & Problem Formulation',
        description: 'Data interpretation, case structuring, analytical deduction, and quantitative aptitude.',
        topics: ['Data Interpretation Charts', 'Logical Syllogisms', 'Analytical Problem Formulation', 'Case Deductions'],
        resourceHint: 'IndiaBIX Logical Reasoning Placement Suite',
        benchmark: 75
      }
    ],
    'Data Analyst': [
      {
        step: 1,
        skillKey: 'DBMS',
        title: 'Relational Database Architecture & SQL',
        description: 'Master relational schemas, multi-table joins, subqueries, group by having, and database normalization.',
        topics: ['Relational Schema Design', 'Multi-table INNER/LEFT JOINs', 'Aggregations & Grouping', 'Subqueries & Normalization', 'Index Performance'],
        resourceHint: 'Mode SQL Tutorial & Use The Index Luke',
        benchmark: 80
      },
      {
        step: 2,
        skillKey: 'Quantitative Aptitude',
        title: 'Business Mathematics & Applied Statistics',
        description: 'Percentages, growth rates, ratios, probability, standard deviation, and statistical inference for business metrics.',
        topics: ['Business Percentage Metrics', 'Descriptive Statistics & Spread', 'Probability & Distributions', 'Ratios & Averages', 'Time-Series Growth'],
        resourceHint: 'IndiaBIX Quantitative Aptitude Practice',
        benchmark: 75
      },
      {
        step: 3,
        skillKey: 'Data Analytics & BI (SQL/Tableau)',
        title: 'Advanced Analytical SQL & BI Dashboards',
        description: 'Analytical window functions (RANK, ROW_NUMBER, PARTITION BY), CTEs, and interactive KPI dashboard design in Tableau/PowerBI.',
        topics: ['Window Functions (PARTITION BY, RANK)', 'CTEs & Temporary Tables', 'Tableau/PowerBI KPI Visuals', 'ETL Data Transformation', 'Executive Reporting'],
        resourceHint: 'StrataScratch SQL Scenarios & Mode Window Functions',
        benchmark: 85
      },
      {
        step: 4,
        skillKey: 'Logical Reasoning',
        title: 'Business Logic & Data Interpretation',
        description: 'Data sufficiency, table & chart interpretation, critical reasoning, and deductive pattern analysis.',
        topics: ['Table & Graph Interpretation', 'Logical Deductions', 'Data Sufficiency Rules', 'Trend Identification'],
        resourceHint: 'IndiaBIX Logical Reasoning Drills',
        benchmark: 75
      },
      {
        step: 5,
        skillKey: 'Verbal Ability',
        title: 'Business Communication & Reporting',
        description: 'Executive written communication, structured reporting, reading comprehension, and presentation clarity.',
        topics: ['Professional Written Clarity', 'Critical Reading Comprehension', 'Data Storytelling & Reporting', 'Grammar Precision'],
        resourceHint: 'IndiaBIX Verbal Ability & Reading Suite',
        benchmark: 70
      }
    ],
    'Cloud & DevOps Engineer': [
      {
        step: 1,
        skillKey: 'Operating Systems',
        title: 'Linux Internals & Operating Systems',
        description: 'Linux shell scripting, process scheduling, memory virtualisation, permissions, and daemon service management.',
        topics: ['Linux CLI & Bash Scripting', 'Process & Thread Management', 'Virtual Memory & File Systems', 'User & Permission Security', 'Systemd Services'],
        resourceHint: 'OSTEP Operating Systems: Three Easy Pieces',
        benchmark: 80
      },
      {
        step: 2,
        skillKey: 'Computer Networks',
        title: 'Computer Networks & Web Infrastructure',
        description: 'TCP/IP protocol stack, DNS routing, HTTP/HTTPS security, SSL/TLS certificates, CIDR subnets, and firewalls.',
        topics: ['TCP/IP & OSI Layers', 'DNS & Domain Routing', 'HTTP/HTTPS & SSL/TLS', 'CIDR Subnets & VPC Networking', 'Firewalls & Load Balancers'],
        resourceHint: 'Stanford CS144 Introduction to Computer Networks',
        benchmark: 80
      },
      {
        step: 3,
        skillKey: 'Data Structures & Algorithms',
        title: 'Automation Scripting & Algorithmic Logic',
        description: 'Data structures, algorithm complexity, string parsing, and automation logic for infrastructure tooling.',
        topics: ['String Parsing & Regex', 'HashMaps & Lookup Trees', 'Algorithmic Complexity (Big-O)', 'Automation Logic'],
        resourceHint: 'NeetCode 150 Coding Patterns & Python Docs',
        benchmark: 65
      },
      {
        step: 4,
        skillKey: 'DBMS',
        title: 'Database Administration & Persistence',
        description: 'Database setup, backup/recovery, relational normalization, SQL administration, and high availability.',
        topics: ['Relational Database Setup', 'Backup & Restore Strategies', 'Indexing & Query Performance', 'High Availability & Replication'],
        resourceHint: 'PostgreSQL Documentation & Use The Index Luke',
        benchmark: 70
      },
      {
        step: 5,
        skillKey: 'Logical Reasoning',
        title: 'Systems Troubleshooting & Root-Cause Logic',
        description: 'Incident triage, log deduction, fault isolation, and analytical reasoning.',
        topics: ['Incident Triage Logic', 'Log Deduction & Root Cause', 'Systems Fault Isolation', 'Analytical Reasoning'],
        resourceHint: 'IndiaBIX Logical Reasoning Drills',
        benchmark: 70
      }
    ]
  };

  const currentRoadmap = careerRoadmaps[targetRole] || careerRoadmaps['Java Full Stack Developer'];

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

  const handleExternalResourceClick = (e) => {
    if (!navigator.onLine) {
      e.preventDefault();
      alert('Need internet connection: Please connect to the internet to access external learning resources.');
    }
  };

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

      {/* Sequential Learning Roadmap Section with Student Expertise */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 stroke-[2.2]" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {targetRole} Sequential Preparation Roadmap
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured chronological milestones showing the exact order in which to master skills and your current verified expertise in each.
            </p>
          </div>
          <Link
            to="/student/analysis"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 shrink-0"
          >
            <span>Explore Full Dynamic Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Roadmap Milestones Cards */}
        <div className="space-y-4">
          {currentRoadmap.map((item, idx) => {
            const hasAttempted = categoryScores[item.skillKey] !== undefined || (parsedBreakdown[item.skillKey] && parsedBreakdown[item.skillKey].attempted);
            const score = categoryScores[item.skillKey] !== undefined
              ? categoryScores[item.skillKey]
              : parsedBreakdown[item.skillKey]?.score || 0;

            const isMastered = hasAttempted && score >= item.benchmark;
            const isCompetent = hasAttempted && score >= 50 && score < item.benchmark;
            const isNeedsFocus = hasAttempted && score < 50;

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isMastered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isCompetent
                    ? 'border-blue-200 bg-blue-50/20'
                    : isNeedsFocus
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Step Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                        STEP {item.step}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      {/* Expertise Status Badge */}
                      {isMastered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Mastery • {score}% (Exceeds {item.benchmark}% Goal)</span>
                        </span>
                      ) : isCompetent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <TrendingUp className="w-3 h-3 text-blue-600" />
                          <span>Developing Competence • {score}% (Target: {item.benchmark}%)</span>
                        </span>
                      ) : isNeedsFocus ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Needs Remedial Focus • {score}% (Deficit: {item.benchmark - score}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Diagnostic Pending (Benchmark Target: {item.benchmark}%)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Sequential Topics */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">Core Modules:</span>
                      {item.topics.map((tpc, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700"
                        >
                          {tpc}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-blue-700 font-semibold pt-0.5">
                      Recommended Resource: <span className="underline">{item.resourceHint}</span>
                    </p>
                  </div>

                  {/* Action Link to Test */}
                  <div className="shrink-0 flex items-center lg:flex-col justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <Link
                      to="/student/tests"
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>{hasAttempted ? 'Re-take Assessment' : 'Take Diagnostic Test'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
