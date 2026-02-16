@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\nodejs;C:\Users\pushkar singh\AppData\Roaming\npm"
set GIT_TERMINAL_PROMPT=0

echo === RESOLVING CONFLICTS === > resolve_output.txt 2>&1
git checkout --ours . >> resolve_output.txt 2>&1
git add . >> resolve_output.txt 2>&1
git commit -m "Merge remote: Keeping local changes" >> resolve_output.txt 2>&1

echo === PUSHING === >> resolve_output.txt 2>&1
git push -u origin main >> resolve_output.txt 2>&1

echo === VERCEL DEPLOY === >> resolve_output.txt 2>&1
call vercel --prod --yes >> resolve_output.txt 2>&1

echo === DONE === >> resolve_output.txt 2>&1
