@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

cd /d "d:\nline health shopping portal with product recommendation Project"

echo === GIT STATUS === > git_output.txt 2>&1
git status >> git_output.txt 2>&1

echo === GIT ADD === >> git_output.txt 2>&1
git add -A >> git_output.txt 2>&1

echo === GIT COMMIT === >> git_output.txt 2>&1
git commit -m "initial commit" >> git_output.txt 2>&1

echo === GIT REMOTE === >> git_output.txt 2>&1
git remote add origin https://github.com/pushkar-web/nline-health-shopping-portal-with-product-recommendation-Project.git >> git_output.txt 2>&1

echo === GIT BRANCH === >> git_output.txt 2>&1
git branch -M main >> git_output.txt 2>&1

echo === GIT PUSH === >> git_output.txt 2>&1
git push -u origin main >> git_output.txt 2>&1

echo === DONE === >> git_output.txt 2>&1
