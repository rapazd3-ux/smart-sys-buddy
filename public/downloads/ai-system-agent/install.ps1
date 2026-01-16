# ============================================================
# AI System Agent - Windows Installer (Tauri)
# Repo: rapazd3-ux/smart-sys-buddy
# Project path: public/downloads/ai-system-agent
# ============================================================

$ErrorActionPreference = "Stop"

$appName = "AI System Agent"
$repoUrl = "https://github.com/rapazd3-ux/smart-sys-buddy.git"
$projectSubPath = "public/downloads/ai-system-agent"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🤖 AI System Agent - Instalador Automático          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# Admin check
# ------------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ Recomenda-se executar como Administrador." -ForegroundColor Yellow
    Write-Host ""
}

# ------------------------------------------------------------
# Dependency check
# ------------------------------------------------------------
function Require-Command($cmd, $name) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $name não encontrado." -ForegroundColor Red
        throw "$name é obrigatório para continuar."
    }
}

Write-Host "🔍 Verificando dependências..." -ForegroundColor Cyan
Require-Command git   "Git"
Require-Command node  "Node.js"
Require-Command npm   "NPM"
Require-Command cargo "Rust (cargo)"
Write-Host "✓ Dependências OK" -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------
# Clone repository
# ------------------------------------------------------------
$tempDir = Join-Path $env:TEMP "ai-system-agent-build"

if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

Write-Host "📂 Clonando repositório smart-sys-buddy..." -ForegroundColor Cyan
git clone $repoUrl $tempDir

if (-not (Test-Path $tempDir)) {
    throw "Falha ao clonar o repositório."
}

# ------------------------------------------------------------
# Enter project directory
# ------------------------------------------------------------
$projectPath = Join-Path $tempDir $projectSubPath

if (-not (Test-Path $projectPath)) {
    throw "Pasta do projeto não encontrada: $projectSubPath"
}

Set-Location $projectPath

# ------------------------------------------------------------
# Install Node dependencies
# ------------------------------------------------------------
Write-Host "📦 Instalando dependências (npm install)..." -ForegroundColor Cyan
npm install

# ------------------------------------------------------------
# Build Tauri app
# ------------------------------------------------------------
Write-Host "🏗️ Compilando o aplicativo (tauri build)..." -ForegroundColor Cyan
npm run tauri build

# ------------------------------------------------------------
# Locate Windows installer
# ------------------------------------------------------------
$msiPath = "src-tauri\target\release\bundle\msi"
$exePath = "src-tauri\target\release\bundle\nsis"

$installer = $null

if (Test-Path $msiPath) {
    $installer = Get-ChildItem "$msiPath\*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1
}

if (-not $installer -and (Test-Path $exePath)) {
    $installer = Get-ChildItem "$exePath\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
}

if (-not $installer) {
    throw "Build concluído, mas nenhum instalador (.msi ou .exe) foi encontrado."
}

# ------------------------------------------------------------
# Install
# ------------------------------------------------------------
Write-Host "🔧 Instalando $($installer.Name)..." -ForegroundColor Cyan

if ($installer.Extension -eq ".msi") {
    Start-Process msiexec.exe -ArgumentList "/i `"$($installer.FullName)`" /passive /norestart" -Wait
} else {
    Start-Process $installer.FullName -ArgumentList "/S" -Wait
}

# ------------------------------------------------------------
# Cleanup
# ------------------------------------------------------------
Set-Location $env:USERPROFILE
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ $appName instalado com sucesso!" -ForegroundColor Green
Write-Host ""
