# Instalação Rápida

## Download via Terminal

### Linux (Ubuntu/Debian)
```bash
# Baixar última versão
curl -sL https://github.com/SEU-USUARIO/ai-system-agent/releases/latest/download/ai-system-agent.deb -o ai-system-agent.deb

# Instalar
sudo dpkg -i ai-system-agent.deb

# Executar
ai-system-agent
```

### Linux (AppImage - Universal)
```bash
# Baixar
curl -sL https://github.com/SEU-USUARIO/ai-system-agent/releases/latest/download/ai-system-agent.AppImage -o ai-system-agent.AppImage

# Tornar executável
chmod +x ai-system-agent.AppImage

# Executar
./ai-system-agent.AppImage
```

### Windows (PowerShell)
```powershell
# Baixar instalador
Invoke-WebRequest -Uri "https://github.com/SEU-USUARIO/ai-system-agent/releases/latest/download/ai-system-agent.msi" -OutFile "ai-system-agent.msi"

# Instalar
Start-Process msiexec.exe -ArgumentList '/i ai-system-agent.msi' -Wait

# Ou baixar e instalar com um comando:
irm https://github.com/SEU-USUARIO/ai-system-agent/releases/latest/download/install.ps1 | iex
```

## Script de Instalação Automática

### Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/SEU-USUARIO/ai-system-agent/main/install.sh | bash
```

### Windows
```powershell
irm https://raw.githubusercontent.com/SEU-USUARIO/ai-system-agent/main/install.ps1 | iex
```

## Build Manual

Se preferir compilar do código fonte:

### Requisitos
- Node.js 18+
- Rust 1.70+
- Dependências do sistema (veja README.md)

### Passos
```bash
# Clone
git clone https://github.com/SEU-USUARIO/ai-system-agent.git
cd ai-system-agent

# Instale dependências
npm install

# Compile
npm run tauri build
```

Os binários estarão em `src-tauri/target/release/bundle/`
