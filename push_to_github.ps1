$ErrorActionPreference = "Continue"
$gitExe = "C:\Program Files\Git\cmd\git.exe"

# Change to project directory
Set-Location -LiteralPath "d:\nline health shopping portal with product recommendation Project"

# Log everything to a file
$logFile = Join-Path (Get-Location) "git_output.txt"

"=== Starting Git Setup ===" | Out-File $logFile

"--- Git Version ---" | Out-File $logFile -Append
& $gitExe --version 2>&1 | Out-File $logFile -Append

"--- Git Init ---" | Out-File $logFile -Append
& $gitExe init 2>&1 | Out-File $logFile -Append

"--- Git Add ---" | Out-File $logFile -Append
& $gitExe add -A 2>&1 | Out-File $logFile -Append

"--- Git Config ---" | Out-File $logFile -Append
& $gitExe config user.email "pushkar-web@users.noreply.github.com" 2>&1 | Out-File $logFile -Append
& $gitExe config user.name "pushkar-web" 2>&1 | Out-File $logFile -Append

"--- Git Commit ---" | Out-File $logFile -Append
& $gitExe commit -m "feat: HealthShop AI portal with product recommendations" 2>&1 | Out-File $logFile -Append

"--- Git Remote ---" | Out-File $logFile -Append
& $gitExe remote add origin "https://github.com/pushkar-web/nline-health-shopping-portal-with-product-recommendation-Project.git" 2>&1 | Out-File $logFile -Append

"--- Git Branch ---" | Out-File $logFile -Append
& $gitExe branch -M main 2>&1 | Out-File $logFile -Append

"--- Git Push ---" | Out-File $logFile -Append
& $gitExe push -u origin main 2>&1 | Out-File $logFile -Append

"=== DONE ===" | Out-File $logFile -Append
