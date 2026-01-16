# AI System Agent - Windows Installer
# Run:
# irm https://raw.githubusercontent.com/rapazd3-ux/smart-sys-buddy/main/public/downloads/ai-system-agent/install.ps1 | iex

$ErrorActionPreference = "Stop"

$repo = "rapazd3-ux/smart-sys-buddy"
$appName = "AI System Agent"
$projectPath = "public/downloads/ai-system-agent"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🤖 AI System Agent - Instalador Automático          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ================= ADMIN CHECK =================
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ Executando sem administrador (recomendado rodar como admin)" -ForegroundColor Yellow
    Write-Host ""
}

# ================= DEP CHECK =================
function Require-Cmd($cmd, $name) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "$name não está instalado. Instale e tente novamente."
    }
}

Require-Cmd git "Git"
Require-Cmd node "Node.js"
Require-Cmd npm "NPM"
Require-Cmd cargo "Rust (cargo)"

# ================= CLONE =================
$tempDir = Join-Path $env:TEMP "ai-system-agent-build"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

Write-Host "📂 Clonando repositório smart-sys-buddy..." -ForegroundColor Cyan
git clone "https://github.com/$repo.git" $tempDir

if (-not (Test-Path $tempDir)) {
    throw "Falha ao clonar o repositório."
}

# ================= ENTER PROJECT =================
$fullProjectPath = Join-Path $tempDir $projectPath

if (-not (Test-Path $fullProjectPath)) {
    throw "Pasta do projeto não encontrada: $projectPath"
}

Set-Location $fullProjectPath

# ================= INSTALL DEPENDENCIES =================
Write-Host "📦 Instalando dependências (npm install)..." -ForegroundColor Cyan
npm install

# ================= BUILD =================
Write-Host "🏗️ Compilando o app (tauri build)..." -ForegroundColor Cyan
npm run tauri build

# ================= INSTALL =================
$installer = Get-ChildItem "src-tauri\target\release\bundle\nsis\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $installer) {
    throw "Build concluído, mas o instalador .exe não foi encontrado."
}

Write-Host "🔧 Instalando aplicativo..." -ForegroundColor Cyan
Start-Process $installer.FullName -ArgumentList "/S" -Wait

# ================= CLEANUP =================
Set-Location $env:USERPROFILE
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ $appName instalado com sucesso!" -ForegroundColor Green
Write-Host ""
