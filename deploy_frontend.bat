@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\nodejs;C:\Users\pushkar singh\AppData\Roaming\npm"
set GIT_TERMINAL_PROMPT=0

echo === ENVIRONMENT CHECK === > deploy_frontend_output.txt 2>&1
git --version >> deploy_frontend_output.txt 2>&1
call vercel --version >> deploy_frontend_output.txt 2>&1

echo === DEPLOYING FRONTEND === >> deploy_frontend_output.txt 2>&1
cd frontend
echo Current Directory: %CD% >> ..\deploy_frontend_output.txt 2>&1
call vercel --prod --yes --name health-shopping-portal >> ..\deploy_frontend_output.txt 2>&1

echo === DONE === >> ..\deploy_frontend_output.txt 2>&1
