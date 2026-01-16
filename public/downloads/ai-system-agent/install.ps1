# AI System Agent - Windows Installer
# Run:
# irm https://raw.githubusercontent.com/rapazd3-ux/smart-sys-buddy/main/public/downloads/ai-system-agent/install.ps1 | iex

$ErrorActionPreference = "Stop"

$appName = "AI System Agent"
$repo = "rapazd3-ux/smart-sys-buddy"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🤖 AI System Agent - Instalador Automático          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Admin check
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ Executando sem privilégios de administrador" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📦 Verificando releases..." -ForegroundColor Cyan
$releaseUrl = "https://api.github.com/repos/$repo/releases/latest"

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing

    if (-not $release.assets -or $release.assets.Count -eq 0) {
        throw "Nenhum asset encontrado"
    }

    $asset = $release.assets |
        Where-Object { $_.name -like "*.exe" -or $_.name -like "*.msi" } |
        Select-Object -First 1

    if (-not $asset) {
        throw "Nenhum instalador (.exe/.msi) encontrado na release"
    }

    Write-Host "✓ Release encontrada: $($release.tag_name)" -ForegroundColor Green

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

    Write-Host "✅ Instalação concluída!" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "⚠️ Nenhuma release instalável encontrada." -ForegroundColor Yellow
    Write-Host "ℹ️ O projeto está presente no repositório, mas não há instalador publicado."
    Write-Host "👉 Compile via README.md ou publique uma release com .exe/.msi."
    Write-Host ""
}

Write-Host "Finalizado."
