# AI System Agent - Windows Installer
# Run: irm https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$repo = "rapazd3-ux/ai-system-agent"
$appName = "AI System Agent"

# Header
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║        🤖 AI System Agent - Instalador Automático          ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Executando sem privilégios de administrador" -ForegroundColor Yellow
    Write-Host "   Algumas funcionalidades podem requerer elevação." -ForegroundColor Gray
    Write-Host ""
}

# Detect architecture
$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
Write-Host "✓ Sistema: Windows $arch" -ForegroundColor Green
Write-Host ""

# Get latest release
Write-Host "📦 Buscando última versão..." -ForegroundColor Cyan
$releaseUrl = "https://api.github.com/repos/$repo/releases/latest"

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing -ErrorAction Stop
    $version = $release.tag_name
    
    # Try to find MSI first, then NSIS exe
    $msiAsset = $release.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
    $exeAsset = $release.assets | Where-Object { $_.name -like "*setup*.exe" -or $_.name -like "*installer*.exe" } | Select-Object -First 1
    
    $asset = if ($msiAsset) { $msiAsset } else { $exeAsset }
    
    if ($asset) {
        Write-Host "✓ Versão encontrada: $version" -ForegroundColor Green
        Write-Host ""
        
        $downloadUrl = $asset.browser_download_url
        $fileName = $asset.name
        $tempFile = Join-Path $env:TEMP $fileName
        
        Write-Host "📥 Baixando $fileName..." -ForegroundColor Cyan
        
        # Download with progress
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($downloadUrl, $tempFile)
        
        Write-Host "✓ Download concluído" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "🔧 Instalando..." -ForegroundColor Cyan
        
        if ($fileName -like "*.msi") {
            $process = Start-Process msiexec.exe -ArgumentList "/i `"$tempFile`" /passive /norestart" -Wait -PassThru
        } else {
            $process = Start-Process $tempFile -ArgumentList "/S" -Wait -PassThru
        }
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✓ Instalação concluída" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Instalação concluída com código: $($process.ExitCode)" -ForegroundColor Yellow
        }
        
        # Cleanup
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    } else {
        throw "Nenhum instalador encontrado na release"
    }
} catch {
    Write-Host ""
    Write-Host "⚠️  Nenhum release encontrado. Compilando do código fonte..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check for Rust
    Write-Host "🦀 Verificando Rust..." -ForegroundColor Cyan
    $hasRust = Get-Command cargo -ErrorAction SilentlyContinue
    
    if (-not $hasRust) {
        Write-Host "📥 Instalando Rust..." -ForegroundColor Cyan
        $rustupInit = Join-Path $env:TEMP "rustup-init.exe"
        Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $rustupInit -UseBasicParsing
        Start-Process $rustupInit -ArgumentList "-y" -Wait
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Remove-Item $rustupInit -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Rust disponível" -ForegroundColor Green
    
    # Check for Node.js
    Write-Host "📗 Verificando Node.js..." -ForegroundColor Cyan
    $hasNode = Get-Command node -ErrorAction SilentlyContinue
    
    if (-not $hasNode) {
        Write-Host "📥 Instalando Node.js..." -ForegroundColor Cyan
        $nodeInstaller = Join-Path $env:TEMP "node-setup.msi"
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" -OutFile $nodeInstaller -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /passive /norestart" -Wait
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Node.js disponível" -ForegroundColor Green
    
    # Clone repository
    Write-Host ""
    Write-Host "📂 Clonando repositório..." -ForegroundColor Cyan
    $tempDir = Join-Path $env:TEMP "ai-system-agent-build"
    
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    
    git clone "https://github.com/$repo.git" $tempDir
    Set-Location $tempDir
    
    # Install dependencies and build
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm install
    
    Write-Host ""
    Write-Host "🏗️  Compilando aplicativo (pode demorar alguns minutos)..." -ForegroundColor Cyan
    npm run tauri build
    
    # Install
    $installer = Get-ChildItem -Path "src-tauri\target\release\bundle\nsis\*.exe" | Select-Object -First 1
    if ($installer) {
        Write-Host "🔧 Instalando..." -ForegroundColor Cyan
        Start-Process $installer.FullName -ArgumentList "/S" -Wait
    }
    
    # Cleanup
    Set-Location $env:USERPROFILE
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║           ✅ Instalação concluída com sucesso!             ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "O $appName foi instalado e está disponível no menu Iniciar." -ForegroundColor White
Write-Host ""
Write-Host "🔐 Segurança:" -ForegroundColor Yellow
Write-Host "   • Nenhum comando é executado sem sua aprovação" -ForegroundColor Gray
Write-Host "   • Chaves de API são armazenadas no Windows Credential Manager" -ForegroundColor Gray
Write-Host "   • Código 100% open-source" -ForegroundColor Gray
Write-Host ""
