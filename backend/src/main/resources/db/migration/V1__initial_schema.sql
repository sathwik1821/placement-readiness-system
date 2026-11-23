-- ==============================================================================
-- ASCEND: AI-Assisted Student Success and Placement Readiness System
-- Flyway Database Schema Migration V1 - Core Architecture
-- Rajiv Gandhi University of Knowledge Technologies (RGUKT)
-- ==============================================================================

-- 1. Identity & Institutional Accounts
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Institutional Student Profiles
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255) DEFAULT '',
    roll_number VARCHAR(100) DEFAULT '',
    college VARCHAR(255) DEFAULT 'RGUKT Srikakulam',
    batch VARCHAR(255) DEFAULT '2027 Graduating Batch • B.Tech E4 (Final Year)',
    year INTEGER DEFAULT 4,
    year_of_study VARCHAR(100) DEFAULT '4th Year (E4)',
    department VARCHAR(255) DEFAULT 'Computer Science & Engineering',
    semester INTEGER DEFAULT 8,
    cgpa DOUBLE PRECISION DEFAULT 0.0,
    graduation_year INTEGER DEFAULT 2027,
    backlogs INTEGER DEFAULT 0,
    phone VARCHAR(50) DEFAULT '',
    skills TEXT DEFAULT '[]',
    interests TEXT DEFAULT '[]',
    portfolio_link VARCHAR(500) DEFAULT '',
    resume_url VARCHAR(500) DEFAULT '',
    resume_file_name VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(graduation_year);

-- 3. Placement Officers
CREATE TABLE IF NOT EXISTS placement_officers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    department VARCHAR(255) DEFAULT 'Training & Placement',
    employee_id VARCHAR(100) DEFAULT '',
    phone VARCHAR(50) DEFAULT ''
);

-- 4. Corporate Partners / Companies
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    website VARCHAR(500),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Placement Drives
CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) DEFAULT '',
    officer_id VARCHAR(255) DEFAULT '',
    title VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    ctc VARCHAR(100) DEFAULT 'Competitive',
    work_mode VARCHAR(50) DEFAULT 'ONSITE',
    job_description TEXT DEFAULT '',
    location VARCHAR(255) DEFAULT 'Campus',
    eligibility_criteria TEXT DEFAULT '{}',
    deadline TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(50) DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drives_status ON placement_drives(status);

-- 6. Placement Applications
CREATE TABLE IF NOT EXISTS placement_applications (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    drive_id VARCHAR(255) NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
    resume_url VARCHAR(500) DEFAULT '',
    resume_file_name VARCHAR(255) DEFAULT '',
    status VARCHAR(50) DEFAULT 'APPLIED',
    applied_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_drive UNIQUE (student_id, drive_id)
);

CREATE INDEX IF NOT EXISTS idx_app_student ON placement_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_app_drive ON placement_applications(drive_id);

-- 7. Assessment Test Categories & Question Bank
CREATE TABLE IF NOT EXISTS test_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    target_departments TEXT DEFAULT '[]',
    target_years TEXT DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(255) PRIMARY KEY,
    test_category_id VARCHAR(255) NOT NULL REFERENCES test_categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    topic VARCHAR(255) DEFAULT '',
    explanation TEXT DEFAULT '',
    marks DOUBLE PRECISION DEFAULT 1.0,
    negative_marks DOUBLE PRECISION DEFAULT 0.25,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_q_cat_diff ON questions(test_category_id, difficulty);

-- 8. Assessment Attempts & Responses
CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    test_category_id VARCHAR(255) NOT NULL REFERENCES test_categories(id) ON DELETE CASCADE,
    score DOUBLE PRECISION DEFAULT 0.0,
    percentage_score DOUBLE PRECISION DEFAULT 0.0,
    total_marks INTEGER DEFAULT 20,
    total_score DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    time_limit_seconds INTEGER DEFAULT 1800,
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS test_responses (
    id VARCHAR(255) PRIMARY KEY,
    test_attempt_id VARCHAR(255) NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(255) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer VARCHAR(255) DEFAULT '',
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INTEGER DEFAULT 15,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI Mock Interview Engine
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'TECHNICAL',
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    overall_score DOUBLE PRECISION DEFAULT 0.0,
    strengths TEXT DEFAULT '',
    improvements TEXT DEFAULT '',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_questions (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'TECHNICAL',
    sequence_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_responses (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(255) NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    response_text TEXT DEFAULT '',
    ai_feedback TEXT DEFAULT '',
    clarity_score DOUBLE PRECISION DEFAULT 0.0,
    technical_score DOUBLE PRECISION DEFAULT 0.0,
    confidence_score DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Analytics, Career Goals & Diagnostic Reports
CREATE TABLE IF NOT EXISTS analysis_reports (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    readiness_score DOUBLE PRECISION DEFAULT 65.0,
    strengths TEXT DEFAULT '[]',
    lagging_aspects TEXT DEFAULT '[]',
    generated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_goals (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    target_package VARCHAR(100) DEFAULT '',
    milestones TEXT DEFAULT '[]',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    resource_title VARCHAR(255) NOT NULL,
    resource_url VARCHAR(500) DEFAULT '',
    reason TEXT DEFAULT '',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'Campus',
    match_score DOUBLE PRECISION DEFAULT 85.0,
    link VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT '',
    salary VARCHAR(100) DEFAULT '',
    description TEXT DEFAULT '',
    requirements TEXT DEFAULT '[]',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_feedback_reports (
    id VARCHAR(255) PRIMARY KEY,
    drive_id VARCHAR(255) NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
    feedback_text TEXT DEFAULT '',
    strengths TEXT DEFAULT '[]',
    shortcomings TEXT DEFAULT '[]',
    recommendations TEXT DEFAULT '[]',
    generated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Centralized Notifications & Recruiter Opportunity Pipeline
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'INFO',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id VARCHAR(255) PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) DEFAULT '',
    recipient_role VARCHAR(50) DEFAULT 'STUDENT',
    notification_type VARCHAR(100) NOT NULL,
    related_entity_id VARCHAR(255) DEFAULT '',
    subject VARCHAR(500),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    failure_reason TEXT,
    deduplication_key VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notif_log_recip ON notification_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notif_log_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notif_log_dedup ON notification_logs(deduplication_key);
CREATE INDEX IF NOT EXISTS idx_notif_log_status ON notification_logs(delivery_status);

CREATE TABLE IF NOT EXISTS recruiter_opportunities (
    id VARCHAR(255) PRIMARY KEY,
    reference_id VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    recruiter_name VARCHAR(255) NOT NULL,
    recruiter_email VARCHAR(255) NOT NULL,
    recruiter_phone VARCHAR(50) DEFAULT '',
    job_title VARCHAR(255),
    job_role VARCHAR(255) NOT NULL,
    ctc VARCHAR(100) DEFAULT 'Competitive',
    work_mode VARCHAR(50) DEFAULT 'ONSITE',
    location VARCHAR(255) DEFAULT 'Campus / Hybrid',
    job_description TEXT DEFAULT '',
    eligibility_criteria TEXT DEFAULT '{}',
    deadline TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    admin_feedback TEXT DEFAULT '',
    recruiter_response TEXT DEFAULT '',
    secure_token VARCHAR(255) UNIQUE,
    token_expiry TIMESTAMP WITHOUT TIME ZONE,
    published_drive_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rec_opp_status ON recruiter_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_rec_opp_email ON recruiter_opportunities(recruiter_email);
CREATE INDEX IF NOT EXISTS idx_rec_opp_token ON recruiter_opportunities(secure_token);

-- 12. Email OTPs
CREATE TABLE IF NOT EXISTS email_otps (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_otp_lookup ON email_otps(email, is_used);
