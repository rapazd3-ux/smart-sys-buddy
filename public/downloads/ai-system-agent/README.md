# AI System Agent

Agente local de automação de sistemas com IA.

## Requisitos

### Linux (Ubuntu/Debian)
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows
- Instale o [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Instale o [Rust](https://rustup.rs/)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ai-system-agent.git
cd ai-system-agent

# Instale dependências Node
npm install

# Compile e execute
npm run tauri dev

# Build para produção
npm run tauri build
```

## Build para distribuição

### Linux (.deb)
```bash
npm run tauri build
# Arquivo em: src-tauri/target/release/bundle/deb/
```

### Windows (.msi / .exe)
```bash
npm run tauri build
# Arquivo em: src-tauri/target/release/bundle/msi/
```

## Segurança

- ✅ Nenhum comando executado sem aprovação explícita
- ✅ Chaves de API armazenadas no keychain do sistema
- ✅ Código 100% open-source
- ✅ Nenhum acesso remoto ou telemetria

## Licença

MIT
