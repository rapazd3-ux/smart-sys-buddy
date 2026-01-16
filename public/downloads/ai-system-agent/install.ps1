# AI System Agent - Windows Installer
# Run:
# irm https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$repo = "rapazd3-ux/ai-system-agent"
$appName = "AI System Agent"

# ================= HEADER =================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║        🤖 AI System Agent - Instalador Automático          ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ================= ADMIN CHECK =================
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Executando sem privilégios de administrador" -ForegroundColor Yellow
    Write-Host "   Algumas funcionalidades podem requerer elevação." -ForegroundColor Gray
    Write-Host ""
}

# ================= ARCH =================
$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
Write-Host "✓ Sistema: Windows $arch" -ForegroundColor Green
Write-Host ""

# ================= RELEASE =================
Write-Host "📦 Buscando última versão..." -ForegroundColor Cyan
$releaseUrl = "https://api.github.com/repos/$repo/releases/latest"

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing
    $version = $release.tag_name

    $asset =
        ($release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1) ??
        ($release.assets | Where-Object { $_.name -like "*setup*.exe" -or $_.name -like "*installer*.exe" } | Select-Object -First 1)

    if (-not $asset) {
        throw "Nenhum instalador encontrado na release"
    }

    Write-Host "✓ Versão encontrada: $version" -ForegroundColor Green
    Write-Host ""

    $tempFile = Join-Path $env:TEMP $asset.name
    Write-Host "📥 Baixando $($asset.name)..." -ForegroundColor Cyan

    Invoke-WebRequest $asset.browser_download_url -OutFile $tempFile -UseBasicParsing
    Write-Host "✓ Download concluído" -ForegroundColor Green
    Write-Host ""

    Write-Host "🔧 Instalando..." -ForegroundColor Cyan
    if ($asset.name -like "*.msi") {
        Start-Process msiexec.exe -ArgumentList "/i `"$tempFile`" /passive /norestart" -Wait
    } else {
        Start-Process $tempFile -ArgumentList "/S" -Wait
    }

    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
}
catch {
    Write-Host ""
    Write-Host "⚠️  Nenhuma release encontrada. Compilando do código fonte..." -ForegroundColor Yellow
    Write-Host ""

    # ================= GIT =================
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git não está instalado. Instale o Git e tente novamente."
    }

    # ================= NODE =================
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "📥 Instalando Node.js..." -ForegroundColor Cyan
        $nodeMsi = Join-Path $env:TEMP "node.msi"
        Invoke-WebRequest "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" -OutFile $nodeMsi -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeMsi`" /passive /norestart" -Wait
        Remove-Item $nodeMsi -Force
    }

    # ================= RUST =================
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Host "📥 Instalando Rust..." -ForegroundColor Cyan
        $rustup = Join-Path $env:TEMP "rustup.exe"
        Invoke-WebRequest "https://win.rustup.rs/x86_64" -OutFile $rustup -UseBasicParsing
        Start-Process $rustup -ArgumentList "-y" -Wait
        Remove-Item $rustup -Force
    }

    # ================= BUILD =================
    $tempDir = Join-Path $env:TEMP "ai-system-agent-build"
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

    Write-Host "📂 Clonando repositório..." -ForegroundColor Cyan
    git clone "https://github.com/$repo.git" $tempDir

    if (-not (Test-Path $tempDir)) {
        throw "Falha ao clonar o repositório."
    }

    Set-Location $tempDir
    npm install
    npm run tauri build

    $installer = Get-ChildItem "src-tauri\target\release\bundle\nsis\*.exe" | Select-Object -First 1
    if ($installer) {
        Start-Process $installer.FullName -ArgumentList "/S" -Wait
    }

    Set-Location $env:USERPROFILE
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

# ================= DONE =================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ Instalação concluída com sucesso!             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "O $appName foi instalado e está disponível no menu Iniciar."
Write-Host ""
