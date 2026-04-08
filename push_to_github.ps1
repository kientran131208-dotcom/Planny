# PLANNY GITHUB AUTOMATION SCRIPT (PRE-FILLED)
Write-Host "--- DANG KHOI TAO GIT CHO DU AN PLANNY ---" -ForegroundColor Cyan

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "LOI: Git chua duoc cai dat. Hay tai tai: https://git-scm.com/" -ForegroundColor Red
    Write-Host "Sau khi cai xong, hay chay lai file nay." -ForegroundColor Yellow
    Pause
    exit
}

# Git Init
if (!(Test-Path .git)) {
    git init
    Write-Host "Da khoi tao Git repository." -ForegroundColor Green
}

# Set Remote URL
$repoUrl = "https://github.com/kientran131208-dotcom/Planny.git"
if (git remote) {
    git remote remove origin
}
git remote add origin $repoUrl
Write-Host "Da ket noi toi: $repoUrl" -ForegroundColor Green

# Add & Commit
git add .
git commit -m "Initial commit: Planny Study App from Antigravity"
Write-Host "Da luu trang thai code (Commit)." -ForegroundColor Green

# Push
git branch -M main
Write-Host "--- DANG DAY CODE LEN GITHUB ---" -ForegroundColor Cyan
Write-Host "Luu y: Neu co cua so dang nhap, hay chon 'Sign in with browser'." -ForegroundColor Yellow
git push -u origin main

Write-Host "--- HOAN TAT! CODE DA LEN GITHUB ---" -ForegroundColor Green
Pause
