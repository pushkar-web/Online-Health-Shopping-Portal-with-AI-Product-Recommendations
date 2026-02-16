@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\nodejs;C:\Users\pushkar singh\AppData\Roaming\npm"
echo === ENVIRONMENT CHECK === > deploy_output.txt 2>&1
git --version >> deploy_output.txt 2>&1
call vercel --version >> deploy_output.txt 2>&1

echo === GIT INIT & CONFIG === >> deploy_output.txt 2>&1
git init >> deploy_output.txt 2>&1
git config user.email "pushkar-web@users.noreply.github.com" >> deploy_output.txt 2>&1
git config user.name "pushkar-web" >> deploy_output.txt 2>&1

echo === GIT REMOTE === >> deploy_output.txt 2>&1
git remote remove origin >> deploy_output.txt 2>&1
git remote add origin https://github.com/pushkar-web/Online-Health-Shopping-Portal-with-AI-Product-Recommendations.git >> deploy_output.txt 2>&1

echo === GIT ADD & COMMIT === >> deploy_output.txt 2>&1
git add . >> deploy_output.txt 2>&1
git commit -m "Update: Latest changes pushed by agent" >> deploy_output.txt 2>&1

echo === GIT PUSH === >> deploy_output.txt 2>&1
git branch -M main >> deploy_output.txt 2>&1
git push -u origin main >> deploy_output.txt 2>&1

echo === DONE === >> deploy_output.txt 2>&1
