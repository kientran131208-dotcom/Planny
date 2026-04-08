# PLANNY GITHUB AUTOMATION SCRIPT V2 (FORCE PUSH)
Write-Host "--- DANG TIEN HANH DAY CODE LEN GITHUB ---" -ForegroundColor Cyan

$gitPath = "D:\Git\cmd\git.exe"
function git { & $gitPath $args }

# Git Workflow
if (!(Test-Path .git)) { git init }

# Set Identity
git config user.email "kientran131208@example.com"
git config user.name "kientran131208-dotcom"

$repoUrl = "https://github.com/kientran131208-dotcom/Planny.git"
try { git remote remove origin } catch {}
git remote add origin $repoUrl
git add .
git commit -m "Initial commit: Planny Study App"
git branch -M main

Write-Host "Dang thuc hien lenh PUSH --FORCE..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host "--- HOAN TAT ---" -ForegroundColor Green
Pause
