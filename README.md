# AI-Assisted Student Success & Placement Readiness System

An enterprise-grade, full-stack institutional web application that bridges the gap between academic curricula and competitive industry hiring benchmarks through **explainable AI-assisted competency diagnostics**, **calibrated placement readiness scoring**, **realistic AI mock interviews**, and **end-to-end campus recruitment lifecycle management**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, Zustand, Axios, Lucide React |
| **Backend** | Spring Boot 3.3.4, Java 21 LTS, Spring Security (Stateless JWT), Spring Data JPA |
| **Database** | H2 Persistent File Database (`./data/placementdb`) |
| **Build** | Maven (Backend), npm + Vite (Frontend) |

---

## 🎯 Core Features

### 1. Multi-Factor Placement Readiness Scoring (0–100%)
Combines academic standing (CGPA), multi-category test performance, and target role criteria into an explainable composite score with a visual radial gauge.

### 2. Mathematical Skill Gap Analysis
Quantifies competency deficits using `Deficit = Required Benchmark − Observed Score`, ranks gaps by severity, and maps them to curated remediation learning paths.

### 3. AI Mock Interview Simulator
Role-targeted (SDE-1, Full Stack, Systems, Data Analyst) technical and behavioral interview sessions with automated NLP rubric evaluation across Technical Depth, Problem Solving, and Communication.

### 4. Campus Placement Operations
- **TPO Console**: Publish drives with eligibility barriers (CGPA cutoffs, department restrictions, backlog caps).
- **Deterministic Eligibility Engine**: Pre-validates every application with transparent disqualification reasons.
- **Multi-Stage Pipeline Tracker**: APPLIED → ASSESSMENT → SHORTLISTED → SELECTED.

### 5. Four-Tier Role-Based Access Control (RBAC)
| Portal | Route | Access |
|---|---|---|
| Student | `/student/*` | Assessments, Analysis, Mock Interview, Jobs, Placement, Profile |
| Placement Officer | `/officer/*` | Drive Management, Application Pipelines, Recruiter Reports |
| Corporate Recruiter | `/company/*` | Candidate Performance Reports, Drive Schedules |
| System Administrator | `/admin/*` | Question Bank Curation, User Governance, System Health |

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** (LTS)
- **Node.js 18+** and npm
- **Maven 3.9+**

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/placement-readiness-system-1.0.0.jar
# Server starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Dev server starts on http://localhost:5173
```

### Demo Credentials
| Role | Email | Password | Details |
|---|---|---|---|
| RGUKT Student (2027 Final Year Batch) | `s210018@rguktsklm.ac.in` | `Student@123` | ID: S210018, CSE, B.Tech E4 |
| RGUKT Student (2028 Pre-Final Year Batch) | `s220145@rguktsklm.ac.in` | `Student@123` | ID: S220145, CSE, B.Tech E3 |
| Placement Officer (TPO) | `officer@college.edu` | `Officer@123` | Full TPO console access |
| Corporate Recruiter | `hr@techcorp.com` | `Company@123` | Drive publishing & candidate review |
| System Admin | `admin@system.com` | `Admin@123` | Question bank & user auditing |

---

## 📁 Project Structure

```
placement-readiness-system/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/          # Controllers, Services, Entities, Security
│   ├── src/main/resources/     # application.properties, data.sql
│   └── pom.xml
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                # Axios instance
│   │   ├── components/         # Reusable UI (ReadinessGauge, etc.)
│   │   ├── layouts/            # AppLayout (sidebar + header)
│   │   ├── pages/              # Role-segregated page modules
│   │   │   ├── admin/
│   │   │   ├── company/
│   │   │   ├── officer/
│   │   │   └── student/
│   │   ├── store/              # Zustand auth store
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── PRODUCT.md                  # Product context & requirements
├── DESIGN.md                   # Design system & visual tokens
└── README.md
```

---

## 📜 License

This project was developed as an academic capstone project for B.Tech Computer Science & Engineering.
