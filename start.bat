@echo off
title AI Placement Readiness System
echo ======================================================================
echo   AI-Assisted Student Success and Placement Readiness System
echo   Backend: Spring Boot 3.3.4 (Java 21) on Port 5000
echo   Frontend: React 18 + Vite + Tailwind CSS on Port 5173
echo ======================================================================

echo Starting Spring Boot Backend...
start "Backend (Spring Boot Port 5000)" cmd /k "cd /d %~dp0backend && java -jar target\placement-readiness-system-1.0.0.jar"

echo Waiting for backend service to initialize...
timeout /t 5 /nobreak >nul

echo Starting React Frontend...
start "Frontend (Vite Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo System successfully started!
echo Frontend Application: http://localhost:5173
echo Backend API Endpoint: http://localhost:5000/api
echo H2 Database Console:  http://localhost:5000/h2-console
echo.
echo Login Credentials (Default Password: <Role>@123):
echo   - Student:   arjun@student.edu  (Password: Student@123)
echo   - Student:   priya@student.edu  (Password: Student@123)
echo   - Officer:   officer@college.edu (Password: Officer@123)
echo   - Recruiter: hr@techcorp.com    (Password: Company@123)
echo   - Admin:     admin@system.com   (Password: Admin@123)
echo ======================================================================
pause
