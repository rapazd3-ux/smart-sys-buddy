# AI System Agent - Windows Installer
# Run:
# irm https://raw.githubusercontent.com/rapazd3-ux/smart-sys-buddy/main/public/downloads/ai-system-agent/install.ps1 | iex

$ErrorActionPreference = "Stop"

$repo = "rapazd3-ux/smart-sys-buddy"
$appName = "AI System Agent"

# ================= HEADER =================
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
    Write-Host "⚠️ Executando sem privilégios de administrador" -ForegroundColor Yellow
    Write-Host ""
}

# ================= ARCH =================
$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
Write-Host "✓ Sistema detectado: Windows $arch" -ForegroundColor Green
Write-Host ""

# ================= RELEASE =================
Write-Host "📦 Buscando última release..." -ForegroundColor Cyan
$releaseUrl = "https://api.github.com/repos/$repo/releases/latest"

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing

    $asset =
        ($release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1) ??
        ($release.assets | Where-Object { $_.name -like "*.exe" } | Select-Object -First 1)

    if (-not $asset) {
        throw "Nenhum instalador encontrado"
    }

    Write-Host "✓ Release encontrada: $($release.tag_name)" -ForegroundColor Green
    Write-Host ""

    $tempFile = Join-Path $env:TEMP $asset.name
    Write-Host "📥 Baixando $($asset.name)..." -ForegroundColor Cyan
    Invoke-WebRequest $asset.browser_download_url -OutFile $tempFile -UseBasicParsing

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
    Write-Host "⚠️ Nenhuma release encontrada. Pulando build automático." -ForegroundColor Yellow
    Write-Host "ℹ️ Este script NÃO tenta clonar repositório inexistente."
    Write-Host ""
}

# ================= DONE =================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ Instalação finalizada                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "O $appName foi processado."
Write-Host ""
