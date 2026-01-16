# AI System Agent

Agente local de automação de sistemas com IA.

## 🚀 Instalação Rápida

### Linux
```bash
curl -fsSL https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.ps1 | iex
```

## 🔧 Build Manual

### Requisitos

#### Linux (Ubuntu/Debian)
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Windows
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [Rust](https://rustup.rs/)
- [Node.js 18+](https://nodejs.org/)

### Compilar

```bash
# Clone o repositório
git clone https://github.com/rapazd3-ux/ai-system-agent.git
cd ai-system-agent

# Instale dependências Node
npm install

# Compile e execute (dev)
npm run tauri dev

# Build para produção
npm run tauri build
```

### Arquivos de Build

- **Linux (.deb)**: `src-tauri/target/release/bundle/deb/`
- **Linux (.AppImage)**: `src-tauri/target/release/bundle/appimage/`
- **Windows (.msi)**: `src-tauri/target/release/bundle/msi/`
- **Windows (.exe)**: `src-tauri/target/release/bundle/nsis/`

## ✨ Funcionalidades

- 💬 **Chat com IA** - Converse com múltiplos provedores (OpenAI, Google, Anthropic, xAI)
- 📝 **Editor de Código** - Editor estilo VS Code integrado
- 🤖 **Assistente de Código** - IA para ajudar com programação
- 🔌 **Sistema de Extensões** - Instale plugins para expandir funcionalidades
- 💻 **Terminal Integrado** - Execute comandos diretamente no app
- 🛡️ **Seguro** - Todos os comandos requerem aprovação

## 🔐 Segurança

- ✅ **Nenhum comando executado sem aprovação explícita**
- ✅ **Chaves de API armazenadas no keychain do sistema** (não em arquivos)
- ✅ **Código 100% open-source** - Audite você mesmo
- ✅ **Sem acesso remoto ou telemetria**
- ✅ **Whitelist de comandos** - Apenas comandos seguros são permitidos

## 📁 Estrutura do Projeto

```
ai-system-agent/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions CI/CD
├── src-tauri/
│   ├── Cargo.toml             # Dependências Rust
│   ├── tauri.conf.json        # Configuração Tauri
│   └── src/
│       ├── main.rs            # Entry point
│       ├── commands.rs        # Comandos do sistema
│       ├── ai_client.rs       # Cliente de IA
│       ├── security.rs        # Gerenciamento de chaves
│       └── config.rs          # Configurações
├── src/
│   ├── App.tsx                # Componente principal
│   ├── store.ts               # Estado global (Zustand)
│   └── components/
│       ├── Chat.tsx           # Interface de chat
│       ├── CodeEditor.tsx     # Editor de código
│       ├── AISidebar.tsx      # Assistente de código
│       ├── Terminal.tsx       # Terminal integrado
│       ├── ExtensionManager.tsx # Gerenciador de extensões
│       ├── Settings.tsx       # Configurações
│       ├── CommandQueue.tsx   # Fila de comandos
│       └── Sidebar.tsx        # Navegação
├── install.sh                 # Script de instalação Linux
├── install.ps1                # Script de instalação Windows
├── package.json
└── README.md
```

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT

## 🔗 Links

- [Página do Projeto](https://smart-sys-buddy.lovable.app)
- [Código Fonte](https://smart-sys-buddy.lovable.app/source-code)
- [Documentação](https://smart-sys-buddy.lovable.app/docs)
