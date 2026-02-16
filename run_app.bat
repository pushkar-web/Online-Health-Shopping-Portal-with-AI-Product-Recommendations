@echo off
echo ==========================================
echo   HealthShop AI - Startup Script
echo ==========================================

echo Starting Backend Server...
cd backend
start "HealthShop Backend" cmd /k ".\mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments=""-Xmx512m"""

echo Starting Frontend Server...
cd ../frontend
start "HealthShop Frontend" cmd /k "npm run dev"

echo ==========================================
echo   Servers are starting in new windows.
echo   Backend: http://localhost:8080
echo   Frontend: http://localhost:3000 (or 3001)
echo ==========================================
pause
