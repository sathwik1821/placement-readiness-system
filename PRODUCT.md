# Product Context: AI-Assisted Student Success and Placement Readiness System

## Users

### 1. Graduating & Pre-Final Year Engineering Students
- **Environment:** Desktop and laptop browsers during placement season, preparing for on-campus drives, reviewing mock interview feedback, and taking technical evaluations.
- **Context of Use:** High-stakes, career-defining placement cycles. Students need clarity on where they stand, why they have skill deficits, and direct actionable steps to improve before recruitment deadlines.

### 2. Training and Placement Officers (TPO)
- **Environment:** Institutional office workstations managing batch-wide recruitment drives, reviewing student qualification pipelines, and tracking corporate hiring outcomes.
- **Context of Use:** High administrative workload; needs immediate insight into batch readiness distributions, drive status, applicant verification, and recruiter feedback.

### 3. Corporate Recruiters & Talent Acquisition Partners
- **Environment:** Corporate laptops reviewing campus applicant pools, evaluating candidate readiness, scheduling interviews, and submitting candidate assessment rubrics.
- **Context of Use:** High-speed candidate screening; values verified competency data, automated eligibility pre-filtering, and streamlined feedback logging.

### 4. Institutional System Administrators
- **Environment:** Administrative consoles managing institutional user access, role assignments, system health, and test category/question bank curation.
- **Context of Use:** Governance, security enforcement, and curriculum-aligned question repository management.

---

## Purpose

### Core Objective
Bridge the divide between academic university curricula and competitive industry hiring benchmarks through explainable, AI-assisted competency diagnostics, calibrated placement readiness scoring, realistic mock interviews, and end-to-end campus recruitment lifecycle management.

### Key Workflows
1. **Diagnostic Evaluation & Readiness Calculation:**
   - Multi-category assessments covering Foundational Aptitude (Quantitative, Logical, Verbal) and Technical Computer Science (DSA, DBMS, OOP, OS, Networks).
   - Real-time computation of the multi-factor Placement Readiness Score (0–100%) combining academic standing (CGPA), test performance, and target role criteria.
2. **Explainable Skill Gap Remediation:**
   - Mathematical deficit ranking (`Deficit = Required Benchmark - Observed Score`) prioritizing high-impact areas with targeted remediation paths.
3. **AI Mock Interview Simulator:**
   - Role-targeted technical and behavioral interview questioning with automated response evaluation and constructive feedback rubrics.
4. **Campus Placement Operations & Eligibility Enforcement:**
   - Publishing campus drives with strict eligibility barriers (minimum CGPA, department restrictions, backlog caps).
   - Real-time pre-validation preventing unqualified candidate submissions and enabling transparent pipeline tracking.

---

## Platform & Scope

- **Platform:** Web application (Desktop-first responsive design, highly scannable layouts for data-dense dashboards).
- **Frontend Stack:** React 18, Vite, Tailwind CSS v3, Axios, Zustand, Lucide React.
- **Backend Stack:** Spring Boot 3.3.4 (Java 21 LTS), Spring Data JPA, Spring Security (Stateless JWT), H2 Persistent Database (`./data/placementdb`).
- **Scope:** Multi-portal institutional SaaS platform with segregated role routes (`/student/*`, `/officer/*`, `/company/*`, `/admin/*`).

---

## Constraints & Requirements

- **Security & RBAC:** Strict Role-Based Access Control via stateless JSON Web Tokens. Subsystems must enforce route guards and server-side role validation.
- **Eligibility Validation:** Deterministic filtering on all recruitment applications; students below CGPA thresholds or outside eligible branches must receive unambiguous disqualification reasons.
- **Performance:** Sub-second client navigation, fast test submission feedback, and local persistent H2 database storage for instant zero-configuration demonstration.
- **Accessibility & Contrast:** High contrast text on all metrics, semantic status badges, and full keyboard-navigable form inputs.

---

## Brand Commitments & Voice

- **Tone:** Academic, authoritative, constructive, precise, and supportive. Zero gimmicky AI hype or false promises.
- **Design Register:** **Enterprise Product Surface.** Prioritize functional clarity, information hierarchy, and data readability over cosmetic decoration.
- **Visual Principles:**
  - **Purposeful Color System:**
    - Slate/Neutral (`#0f172a` / `#f8fafc`): Structural framing, navigation, and neutral reading backgrounds.
    - Deep Indigo / Royal Violet: Primary actions, institutional identity, and system anchors.
    - Emerald / Teal (`#059669`): Verified strengths, high readiness scores, eligible drives, and selections.
    - Amber / Orange (`#d97706`): Moderate readiness, ongoing assessments, warnings, and pending approvals.
    - Rose / Crimson (`#e11d48`): High-priority skill deficits, disqualification boundaries, and deletion actions.
  - **Anti-Patterns & Guardrails:**
    - Avoid arbitrary card-within-card nesting without clear visual hierarchy.
    - Avoid low-contrast text on colored backgrounds.
    - Avoid ambiguous loading spinners without contextual progress indicators.
    - Avoid generic AI buzzwords; use concrete engineering terms (e.g. *Calibrated Readiness Index*, *Deficit Ranking*, *Curated Remediation*).
