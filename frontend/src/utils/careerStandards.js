import { Coffee, Code2, Cpu, BarChart3 } from 'lucide-react';

/**
 * Single Source of Truth for the 4 Strict Industry-Standard Career Tracks.
 */

export const CANONICAL_CAREERS = {
  JAVA_FULL_STACK: 'Java Full Stack Developer',
  MERN_FULL_STACK: 'MERN Full Stack Developer',
  AI_ML_ENGINEER: 'AI / ML Engineer',
  DATA_ANALYST: 'Data Analyst'
};

export const CAREER_TRACKS = [
  {
    role: CANONICAL_CAREERS.JAVA_FULL_STACK,
    shortName: 'Java Full Stack',
    icon: Coffee,
    domain: 'Enterprise Distributed Systems & Cloud Microservices',
    industry: 'Technology & Enterprise Software',
    stack: 'Java 21 • Spring Boot • Microservices • React • PostgreSQL • Kafka',
    description:
      'Engineers mission-critical enterprise backends, distributed microservices, Spring Data JPA persistence, and modern responsive React web clients.',
    focus: 'Microservices architecture, REST APIs, Hibernate ORM, SQL indexing, and full-stack integration',
    hiringExpectation: 'Stringent multi-tier technical rounds testing Java internals, Spring architecture, DSA, and database optimization.',
    badgeClass: 'text-amber-600 bg-amber-50 border-amber-200',
    colorTheme: 'amber',
    benchmarks: {
      'Java & Spring Boot': 80,
      'Data Structures & Algorithms': 75,
      'DBMS': 75,
      'Web Frontend & React': 70,
      'OOP Concepts': 75,
      'Quantitative Aptitude': 70,
      'Logical Reasoning': 70
    },
    roadmap: [
      { step: 1, skillKey: 'OOP Concepts', title: 'Core Java & OOP', benchmark: 75, focus: 'SOLID, Collections, Generics, Memory Model' },
      { step: 2, skillKey: 'Data Structures & Algorithms', title: 'DSA & Algorithms', benchmark: 75, focus: 'Trees, Graphs, DP, Time Complexity' },
      { step: 3, skillKey: 'DBMS', title: 'Relational DBMS & SQL', benchmark: 75, focus: 'ACID, Normalization, Joins, B-Tree Indexes' },
      { step: 4, skillKey: 'Java & Spring Boot', title: 'Spring Boot APIs', benchmark: 80, focus: 'REST APIs, Dependency Injection, JPA, Security' },
      { step: 5, skillKey: 'Web Frontend & React', title: 'React Frontend', benchmark: 70, focus: 'Hooks, State Management, Component Architecture' },
      { step: 6, skillKey: 'Quantitative Aptitude', title: 'Campus Screening', benchmark: 70, focus: 'Speed-Distance-Time, Probability, Ratios' }
    ]
  },
  {
    role: CANONICAL_CAREERS.MERN_FULL_STACK,
    shortName: 'MERN Stack',
    icon: Code2,
    domain: 'Modern Web Architectures & Cloud-Native SaaS',
    industry: 'SaaS Platforms & Product Startups',
    stack: 'React 18 • Node.js • Express • MongoDB • Next.js • TypeScript',
    description:
      'Designs reactive, high-throughput cloud web applications with asynchronous event-driven Node.js runtimes, Express routing, and MongoDB document modeling.',
    focus: 'Asynchronous event loops, REST/GraphQL APIs, document schema design, and reactive frontend architectures',
    hiringExpectation: 'Rigorous rounds on JavaScript event-loop concurrency, React component lifecycles, and scalable API middleware design.',
    badgeClass: 'text-blue-600 bg-blue-50 border-blue-200',
    colorTheme: 'blue',
    benchmarks: {
      'Web Frontend & React': 85,
      'Node.js & Backend Architecture': 80,
      'DBMS': 75,
      'Data Structures & Algorithms': 70,
      'OOP Concepts': 75,
      'Logical Reasoning': 70
    },
    roadmap: [
      { step: 1, skillKey: 'OOP Concepts', title: 'JavaScript & OOP', benchmark: 75, focus: 'ES6+, Closures, Prototype, Async/Await' },
      { step: 2, skillKey: 'Data Structures & Algorithms', title: 'DSA & Logic', benchmark: 70, focus: 'Array manipulation, Two Pointers, Hashing' },
      { step: 3, skillKey: 'DBMS', title: 'NoSQL & Data Modeling', benchmark: 75, focus: 'MongoDB, Mongoose schemas, Indexing, Aggregations' },
      { step: 4, skillKey: 'Node.js & Backend Architecture', title: 'Node & Express', benchmark: 80, focus: 'Middleware, JWT authentication, RESTful APIs' },
      { step: 5, skillKey: 'Web Frontend & React', title: 'React 18 Frontend', benchmark: 85, focus: 'Virtual DOM, Custom Hooks, Redux Toolkit' },
      { step: 6, skillKey: 'Logical Reasoning', title: 'Cognitive Reasoning', benchmark: 70, focus: 'Logical deductions, Sequence analysis, Patterns' }
    ]
  },
  {
    role: CANONICAL_CAREERS.AI_ML_ENGINEER,
    shortName: 'AI / ML Track',
    icon: Cpu,
    domain: 'Artificial Intelligence, Deep Learning & Predictive Systems',
    industry: 'AI Research, DeepTech & Autonomous Systems',
    stack: 'Python • Scikit-Learn • PyTorch • TensorFlow • Pandas • NumPy',
    description:
      'Builds mathematical and neural learning pipelines, implementing statistical data preprocessing, hyperparameter optimization, and deep learning models.',
    focus: 'Supervised/unsupervised learning, neural network layers, loss functions, and algorithmic data preprocessing',
    hiringExpectation: 'Deep technical interviews probing statistical hypothesis testing, loss convergence, model overfitting mitigation, and linear algebra.',
    badgeClass: 'text-purple-600 bg-purple-50 border-purple-200',
    colorTheme: 'purple',
    benchmarks: {
      'Machine Learning & Python': 85,
      'Data Structures & Algorithms': 75,
      'Quantitative Aptitude': 80,
      'DBMS': 70,
      'Logical Reasoning': 75
    },
    roadmap: [
      { step: 1, skillKey: 'OOP Concepts', title: 'Python & Linear Algebra', benchmark: 75, focus: 'Vectorized NumPy, Matrix Operations, OOP' },
      { step: 2, skillKey: 'Quantitative Aptitude', title: 'Probability & Stats', benchmark: 80, focus: 'Distributions, Bayes Theorem, Calculus' },
      { step: 3, skillKey: 'Data Structures & Algorithms', title: 'DSA & Optimization', benchmark: 75, focus: 'Algorithmic efficiency, Graph traversals' },
      { step: 4, skillKey: 'DBMS', title: 'SQL & Data Extraction', benchmark: 70, focus: 'Analytical queries, ETL transformations' },
      { step: 5, skillKey: 'Machine Learning & Python', title: 'ML & Neural Networks', benchmark: 85, focus: 'Classification, Scikit-Learn, PyTorch, Tuning' },
      { step: 6, skillKey: 'Logical Reasoning', title: 'Critical Deduction', benchmark: 75, focus: 'Data sufficiency, Complex pattern reasoning' }
    ]
  },
  {
    role: CANONICAL_CAREERS.DATA_ANALYST,
    shortName: 'Data Analytics',
    icon: BarChart3,
    domain: 'Business Intelligence, Analytics & Quantitative Modeling',
    industry: 'Finance, E-Commerce & Strategic Analytics',
    stack: 'Advanced SQL • Power BI • Tableau • Python Pandas • Excel Modeling',
    description:
      'Transforms raw transactional datasets into strategic executive intelligence using advanced SQL window functions, statistical testing, and automated BI dashboards.',
    focus: 'Analytical SQL partitioning, KPI metrics engineering, ETL pipelines, and visual data storytelling',
    hiringExpectation: 'Live SQL query coding with complex subqueries, partition functions, schema design, and quantitative business case studies.',
    badgeClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    colorTheme: 'emerald',
    benchmarks: {
      'Data Analytics & BI (SQL/Tableau)': 85,
      'DBMS': 80,
      'Quantitative Aptitude': 75,
      'Logical Reasoning': 75,
      'Verbal Ability': 70
    },
    roadmap: [
      { step: 1, skillKey: 'DBMS', title: 'Relational DB & SQL', benchmark: 80, focus: 'DDL, DML, Subqueries, Normalization, Keys' },
      { step: 2, skillKey: 'Quantitative Aptitude', title: 'Business Statistics', benchmark: 75, focus: 'Percentages, Growth metrics, Ratios, Variances' },
      { step: 3, skillKey: 'Data Analytics & BI (SQL/Tableau)', title: 'BI & Tableau Analytics', benchmark: 85, focus: 'Window functions, PARTITION BY, Dashboards' },
      { step: 4, skillKey: 'Logical Reasoning', title: 'Data Interpretation', benchmark: 75, focus: 'Charts, Graphs, Multi-variable inferences' },
      { step: 5, skillKey: 'Verbal Ability', title: 'Executive Communication', benchmark: 70, focus: 'Technical reports, Business presentations' }
    ]
  }
];

export const ROLE_RECOMMENDED_TESTS = {
  [CANONICAL_CAREERS.JAVA_FULL_STACK]: [
    'Java & Spring Boot',
    'Web Frontend & React',
    'Data Structures & Algorithms',
    'DBMS',
    'OOP Concepts',
    'Quantitative Aptitude',
    'Logical Reasoning'
  ],
  [CANONICAL_CAREERS.MERN_FULL_STACK]: [
    'Web Frontend & React',
    'Node.js & Backend Architecture',
    'DBMS',
    'Data Structures & Algorithms',
    'OOP Concepts',
    'Logical Reasoning'
  ],
  [CANONICAL_CAREERS.AI_ML_ENGINEER]: [
    'Machine Learning & Python',
    'Data Structures & Algorithms',
    'Quantitative Aptitude',
    'DBMS',
    'Logical Reasoning'
  ],
  [CANONICAL_CAREERS.DATA_ANALYST]: [
    'Data Analytics & BI (SQL/Tableau)',
    'DBMS',
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability'
  ]
};

export function getCareerTrack(roleName) {
  if (!roleName) return CAREER_TRACKS[0];
  const r = roleName.trim().toLowerCase();
  if (r.includes('mern') || (r.includes('node') && r.includes('react'))) {
    return CAREER_TRACKS[1];
  } else if (r.includes('ai') || r.includes('ml') || r.includes('machine learning')) {
    return CAREER_TRACKS[2];
  } else if (r.includes('data') && (r.includes('analyst') || r.includes('analytics'))) {
    return CAREER_TRACKS[3];
  }
  return CAREER_TRACKS[0];
}

export function getRoadmapForRole(roleName) {
  return getCareerTrack(roleName).roadmap;
}
