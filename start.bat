@echo off
title Ascend - AI Placement Readiness System
echo ======================================================================
echo   ASCEND: AI-Assisted Student Success and Placement Readiness System
echo   Backend:  Spring Boot 3.3.4 (Java 21 LTS) on Port 5000
echo   Frontend: React 19 + Vite + Tailwind CSS on Port 5173
echo   Database: PostgreSQL 16 (placementdb) on Port 5432
echo ======================================================================

echo Starting Spring Boot Backend...
start "Backend (Spring Boot Port 5000)" cmd /k "cd /d %~dp0backend && java -jar target\placement-readiness-system-1.0.0.jar"

echo Waiting for backend service to initialize...
timeout /t 5 /nobreak >nul

echo Starting React Frontend...
start "Frontend (Vite Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo Ascend successfully started!
echo Frontend Application: http://localhost:5173
echo Backend API Endpoint: http://localhost:5000/api
echo PostgreSQL Database:  localhost:5432/placementdb
echo.
echo Login Credentials:
echo   - Student (RGUKT E4): s210018@rguktsklm.ac.in  (Password: sathwik@18 or Student@123)
echo   - Student (RGUKT E3): s220145@rguktsklm.ac.in  (Password: Student@123)
echo   - Placement Officer:  officer@college.edu       (Password: Officer@123)
echo   - Recruiter:          hr@techcorp.com           (Password: Company@123)
echo   - System Admin:       admin@system.com          (Password: Admin@123)
echo ======================================================================
pause
