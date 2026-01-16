# AI System Agent - Windows Installer
# Run: irm https://raw.githubusercontent.com/SEU-USUARIO/ai-system-agent/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$repo = "SEU-USUARIO/ai-system-agent"
$appName = "AI System Agent"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     AI System Agent - Instalador       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get latest release
Write-Host "→ Buscando última versão..." -ForegroundColor Yellow
$releaseUrl = "https://api.github.com/repos/$repo/releases/latest"

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing
    $msiAsset = $release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
    
    if (-not $msiAsset) {
        throw "Nenhum arquivo .msi encontrado na release"
    }
    
    $downloadUrl = $msiAsset.browser_download_url
    $version = $release.tag_name
    
    Write-Host "→ Versão: $version" -ForegroundColor Green
    Write-Host "→ Baixando instalador..." -ForegroundColor Yellow
    
    $tempFile = "$env:TEMP\ai-system-agent.msi"
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempFile -UseBasicParsing
    
    Write-Host "→ Iniciando instalação..." -ForegroundColor Yellow
    Start-Process msiexec.exe -ArgumentList "/i `"$tempFile`" /passive" -Wait
    
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        Instalação concluída! ✓         ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "O $appName foi instalado e está disponível no menu Iniciar." -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "Erro durante a instalação: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente baixar manualmente:" -ForegroundColor Yellow
    Write-Host "https://github.com/$repo/releases" -ForegroundColor Cyan
    exit 1
}
