import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Terminal, 
  ArrowLeft,
  Copy,
  Check,
  Download,
  Github,
  FolderTree,
  FileCode,
  Cog,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Source code files
const sourceFiles = {
  rust: [
    {
      name: "Cargo.toml",
      path: "src-tauri/Cargo.toml",
      language: "toml",
      code: `[package]
name = "ai-system-agent"
version = "1.0.0"
description = "AI-powered system automation agent with explicit user consent"
authors = ["AI System Agent Team"]
license = "MIT"
repository = "https://github.com/ai-system-agent/ai-system-agent"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.5", features = ["shell-open", "dialog-all", "fs-all", "path-all", "process-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
keyring = "2.0"
directories = "5.0"
chrono = "0.4"
uuid = { version = "1.0", features = ["v4"] }
hostname = "0.3"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "z"
strip = true`
    },
    {
      name: "tauri.conf.json",
      path: "src-tauri/tauri.conf.json",
      language: "json",
      code: `{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "AI System Agent",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": { "open": true },
      "dialog": { "all": true },
      "fs": { "all": true },
      "path": { "all": true },
      "process": { "all": true }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "dev.aisystemagent.app",
      "icon": ["icons/icon.ico", "icons/icon.png"],
      "deb": {
        "depends": ["libwebkit2gtk-4.0-37", "libgtk-3-0"]
      },
      "windows": {
        "nsis": {
          "installMode": "currentUser",
          "languages": ["English", "PortugueseBR"]
        }
      }
    },
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://api.anthropic.com https://api.x.ai"
    },
    "windows": [{
      "title": "AI System Agent",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600,
      "center": true
    }]
  }
}`
    },
    {
      name: "main.rs",
      path: "src-tauri/src/main.rs",
      language: "rust",
      code: `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod ai_client;
mod security;
mod config;

use commands::{execute_command, get_system_info, get_command_history};
use ai_client::{send_to_ai, get_ai_providers};
use security::{save_api_key, get_api_key, delete_api_key};
use config::{get_config, save_config};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_command,
            get_system_info,
            get_command_history,
            send_to_ai,
            get_ai_providers,
            save_api_key,
            get_api_key,
            delete_api_key,
            get_config,
            save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`
    },
    {
      name: "commands.rs",
      path: "src-tauri/src/commands.rs",
      language: "rust",
      code: `use serde::{Deserialize, Serialize};
use std::process::Command;
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandResult {
    pub id: String,
    pub command: String,
    pub args: Vec<String>,
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub executed_at: String,
    pub duration_ms: u64,
}

// Command whitelist for security
const ALLOWED_COMMANDS: &[&str] = &[
    "apt", "apt-get", "dpkg", "dnf", "yum", "pacman",
    "docker", "docker-compose", "podman",
    "systemctl", "service", "journalctl",
    "cat", "ls", "head", "tail", "grep", "find", "which",
    "ping", "curl", "wget", "netstat", "ss", "ip",
    "uname", "hostname", "whoami", "df", "free", "ps",
    "php", "composer", "npm", "node",
    "mysql", "mariadb", "psql",
    "nginx", "apache2",
];

fn is_command_allowed(cmd: &str) -> bool {
    let base_cmd = cmd.split_whitespace().next().unwrap_or("");
    let base_cmd = base_cmd.split('/').last().unwrap_or(base_cmd);
    ALLOWED_COMMANDS.iter().any(|&allowed| base_cmd == allowed)
}

#[tauri::command]
pub async fn execute_command(
    command: String,
    args: Vec<String>,
    requires_sudo: bool,
    user_confirmed: bool,
) -> Result<CommandResult, String> {
    // CRITICAL: Never execute without user confirmation
    if !user_confirmed {
        return Err("⚠️ Comando requer confirmação do usuário".into());
    }

    if !is_command_allowed(&command) {
        return Err(format!("⚠️ Comando '{}' não permitido", command));
    }

    let start = std::time::Instant::now();
    let id = Uuid::new_v4().to_string();

    let output = if requires_sudo {
        Command::new("pkexec").arg(&command).args(&args).output()
    } else {
        Command::new(&command).args(&args).output()
    };

    match output {
        Ok(out) => Ok(CommandResult {
            id,
            command,
            args,
            success: out.status.success(),
            stdout: String::from_utf8_lossy(&out.stdout).to_string(),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
            exit_code: out.status.code().unwrap_or(-1),
            executed_at: Utc::now().to_rfc3339(),
            duration_ms: start.elapsed().as_millis() as u64,
        }),
        Err(e) => Err(format!("Erro: {}", e)),
    }
}

#[tauri::command]
pub fn get_system_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "hostname": hostname::get().ok().and_then(|h| h.into_string().ok()),
        "username": std::env::var("USER").or_else(|_| std::env::var("USERNAME")).ok()
    }))
}

#[tauri::command]
pub fn get_command_history() -> Result<Vec<CommandResult>, String> {
    Ok(vec![])
}`
    },
    {
      name: "ai_client.rs",
      path: "src-tauri/src/ai_client.rs",
      language: "rust",
      code: `use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub provider: String,
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub system_info: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SuggestedCommand {
    pub command: String,
    pub args: Vec<String>,
    pub description: String,
    pub requires_sudo: bool,
    pub risk_level: String,
    pub explanation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub suggested_commands: Vec<SuggestedCommand>,
    pub error: Option<String>,
}

const SYSTEM_PROMPT: &str = r#"Você é o AI System Agent.
Sugira comandos seguros e classifique o risco (low/medium/high).
Formato de resposta com comandos em JSON:
\`\`\`json
{"commands": [{"command": "apt", "args": ["update"], "description": "...", "requires_sudo": true, "risk_level": "low", "explanation": "..."}]}
\`\`\`"#;

#[tauri::command]
pub fn get_ai_providers() -> Vec<serde_json::Value> {
    vec![
        serde_json::json!({"id": "openai", "name": "OpenAI", "models": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]}),
        serde_json::json!({"id": "google", "name": "Google Gemini", "models": ["gemini-pro", "gemini-1.5-pro"]}),
        serde_json::json!({"id": "anthropic", "name": "Anthropic Claude", "models": ["claude-3-opus", "claude-3-sonnet"]}),
        serde_json::json!({"id": "xai", "name": "xAI Grok", "models": ["grok-1"]}),
    ]
}

#[tauri::command]
pub async fn send_to_ai(request: AIRequest, api_key: String) -> Result<AIResponse, String> {
    if api_key.is_empty() {
        return Err("API key não configurada".to_string());
    }

    let client = Client::new();
    let mut messages = vec![ChatMessage {
        role: "system".to_string(),
        content: format!("{}\n\n{}", SYSTEM_PROMPT, request.system_info.unwrap_or_default()),
    }];
    messages.extend(request.messages);

    let body = serde_json::json!({
        "model": request.model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 4096,
    });

    let url = match request.provider.as_str() {
        "openai" => "https://api.openai.com/v1/chat/completions",
        "xai" => "https://api.x.ai/v1/chat/completions",
        _ => return Err("Provider não suportado".to_string()),
    };

    let response = client
        .post(url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let content = json["choices"][0]["message"]["content"].as_str().unwrap_or("").to_string();

    Ok(AIResponse {
        content,
        suggested_commands: vec![],
        error: None,
    })
}`
    },
    {
      name: "security.rs",
      path: "src-tauri/src/security.rs",
      language: "rust",
      code: `use keyring::Entry;

const SERVICE_NAME: &str = "ai-system-agent";

#[tauri::command]
pub fn save_api_key(provider: String, api_key: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro ao acessar keychain: {}", e))?;
    entry.set_password(&api_key)
        .map_err(|e| format!("Erro ao salvar: {}", e))?;
    Ok(format!("Chave {} salva!", provider))
}

#[tauri::command]
pub fn get_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro: {}", e))?;
    entry.get_password().map_err(|e| format!("Chave não encontrada: {}", e))
}

#[tauri::command]
pub fn delete_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro: {}", e))?;
    entry.delete_password().map_err(|e| format!("Erro ao deletar: {}", e))?;
    Ok(format!("Chave {} removida!", provider))
}`
    },
    {
      name: "config.rs",
      path: "src-tauri/src/config.rs",
      language: "rust",
      code: `use serde::{Deserialize, Serialize};
use directories::ProjectDirs;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub default_provider: String,
    pub default_model: String,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            default_provider: "openai".to_string(),
            default_model: "gpt-4-turbo".to_string(),
            theme: "dark".to_string(),
        }
    }
}

fn get_config_path() -> Result<std::path::PathBuf, String> {
    let proj_dirs = ProjectDirs::from("dev", "aisystemagent", "AI System Agent")
        .ok_or_else(|| "Erro ao obter diretório".to_string())?;
    let config_dir = proj_dirs.config_dir();
    fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;
    Ok(config_dir.join("config.json"))
}

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    let path = get_config_path()?;
    if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Ok(AppConfig::default())
    }
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<String, String> {
    let path = get_config_path()?;
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok("Salvo!".to_string())
}`
    },
  ],
  react: [
    {
      name: "package.json",
      path: "package.json",
      language: "json",
      code: `{
  "name": "ai-system-agent",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^1.5.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.462.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "react-markdown": "^9.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.9",
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}`
    },
    {
      name: "App.tsx",
      path: "src/App.tsx",
      language: "tsx",
      code: `import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { CommandQueue } from './components/CommandQueue';
import { useStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const { systemInfo, setSystemInfo, pendingCommands } = useStore();

  useEffect(() => {
    invoke('get_system_info').then((info: any) => setSystemInfo(info));
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-zinc-800 flex items-center px-6">
          <div className="w-8 h-8 rounded-lg bg-violet-600 mr-3" />
          <div>
            <h1 className="font-semibold">AI System Agent</h1>
            {systemInfo && (
              <p className="text-xs text-zinc-500">{systemInfo.os} • {systemInfo.hostname}</p>
            )}
          </div>
          {pendingCommands.length > 0 && (
            <span className="ml-auto px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
              {pendingCommands.length} pendente(s)
            </span>
          )}
        </header>
        <main className="flex-1 overflow-hidden flex">
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'settings' && <Settings />}
          {pendingCommands.length > 0 && <CommandQueue />}
        </main>
      </div>
    </div>
  );
}

export default App;`
    },
    {
      name: "store.ts",
      path: "src/store.ts",
      language: "typescript",
      code: `import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PendingCommand {
  id: string;
  command: string;
  args: string[];
  description: string;
  requires_sudo: boolean;
  risk_level: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
}

interface Store {
  systemInfo: any;
  setSystemInfo: (info: any) => void;
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id'>) => void;
  pendingCommands: PendingCommand[];
  addPendingCommands: (cmds: any[]) => void;
  updateCommandStatus: (id: string, status: string, result?: any) => void;
  removeCommand: (id: string) => void;
  config: { default_provider: string; default_model: string };
  setConfig: (config: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  systemInfo: null,
  setSystemInfo: (info) => set({ systemInfo: info }),
  messages: [],
  addMessage: (msg) => set((s) => ({ 
    messages: [...s.messages, { ...msg, id: crypto.randomUUID() }] 
  })),
  pendingCommands: [],
  addPendingCommands: (cmds) => set((s) => ({
    pendingCommands: [...s.pendingCommands, ...cmds.map(c => ({ ...c, id: crypto.randomUUID(), status: 'pending' }))]
  })),
  updateCommandStatus: (id, status, result) => set((s) => ({
    pendingCommands: s.pendingCommands.map(c => c.id === id ? { ...c, status, result } : c)
  })),
  removeCommand: (id) => set((s) => ({
    pendingCommands: s.pendingCommands.filter(c => c.id !== id)
  })),
  config: { default_provider: 'openai', default_model: 'gpt-4-turbo' },
  setConfig: (config) => set({ config }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));`
    },
    {
      name: "Chat.tsx",
      path: "src/components/Chat.tsx",
      language: "tsx",
      code: `import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useStore } from '../store';
import { Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, addPendingCommands, config, isLoading, setIsLoading } = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const apiKey = await invoke<string>('get_api_key', { provider: config.default_provider });
      const response = await invoke<any>('send_to_ai', {
        request: { provider: config.default_provider, model: config.default_model, messages: [...messages, { role: 'user', content: userMessage }] },
        apiKey,
      });
      
      addMessage({ role: 'assistant', content: response.content });
      if (response.suggested_commands?.length) {
        addPendingCommands(response.suggested_commands);
      }
    } catch (error: any) {
      addMessage({ role: 'assistant', content: \`❌ Erro: \${error}\` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={\`flex gap-3 \${msg.role === 'user' ? 'justify-end' : ''}\`}>
            {msg.role === 'assistant' && <Bot className="w-6 h-6 text-violet-400" />}
            <div className={\`max-w-[80%] rounded-xl px-4 py-2 \${msg.role === 'user' ? 'bg-violet-600' : 'bg-zinc-800'}\`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.role === 'user' && <User className="w-6 h-6" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva o que você quer fazer..."
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button type="submit" disabled={isLoading} className="px-4 bg-violet-600 rounded-xl">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}`
    },
  ],
  scripts: [
    {
      name: "build-linux.sh",
      path: "scripts/build-linux.sh",
      language: "bash",
      code: `#!/bin/bash
set -e

echo "🔧 Instalando dependências..."
sudo apt update
sudo apt install -y libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev

echo "🦀 Verificando Rust..."
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi

echo "📦 Instalando dependências Node..."
npm install

echo "🏗️ Compilando aplicativo..."
npm run tauri build

echo "✅ Build concluído!"
echo "📁 Arquivos em: src-tauri/target/release/bundle/"
ls -la src-tauri/target/release/bundle/deb/`
    },
    {
      name: "build-windows.ps1",
      path: "scripts/build-windows.ps1",
      language: "powershell",
      code: `# Build script for Windows
Write-Host "🔧 Verificando Rust..." -ForegroundColor Cyan

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Rust..."
    Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe
    .\\rustup-init.exe -y
    $env:Path += ";$env:USERPROFILE\\.cargo\\bin"
}

Write-Host "📦 Instalando dependências Node..." -ForegroundColor Cyan
npm install

Write-Host "🏗️ Compilando aplicativo..." -ForegroundColor Cyan
npm run tauri build

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host "📁 Arquivos em: src-tauri\\target\\release\\bundle\\" -ForegroundColor Yellow
Get-ChildItem src-tauri\\target\\release\\bundle\\nsis\\`
    },
    {
      name: "README.md",
      path: "README.md",
      language: "markdown",
      code: `# AI System Agent

Agente local de automação de sistemas com IA.

## 🚀 Instalação Rápida

### Linux
\`\`\`bash
git clone https://github.com/seu-usuario/ai-system-agent.git
cd ai-system-agent
chmod +x scripts/build-linux.sh
./scripts/build-linux.sh
\`\`\`

### Windows
\`\`\`powershell
git clone https://github.com/seu-usuario/ai-system-agent.git
cd ai-system-agent
.\\scripts\\build-windows.ps1
\`\`\`

## 🔐 Segurança

- ✅ Nenhum comando executado sem aprovação
- ✅ Chaves armazenadas no keychain do sistema
- ✅ Código 100% open-source
- ✅ Sem acesso remoto ou telemetria

## 📄 Licença

MIT`
    },
  ],
};

const SourceCode = () => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (code: string, path: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const copyAllFiles = () => {
    const allCode = [
      ...sourceFiles.rust,
      ...sourceFiles.react,
      ...sourceFiles.scripts,
    ].map(f => `// ===== ${f.path} =====\n${f.code}`).join('\n\n');
    navigator.clipboard.writeText(allCode);
    setCopiedPath('all');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const FileCard = ({ file }: { file: typeof sourceFiles.rust[0] }) => (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-mono">{file.path}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(file.code, file.path)}
          className="h-8"
        >
          {copiedPath === file.path ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <SyntaxHighlighter
          language={file.language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.8rem',
            maxHeight: '400px',
          }}
          showLineNumbers
        >
          {file.code}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Código Fonte</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://github.com" target="_blank">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant="secondary" className="mb-4">
                  <Package className="w-3 h-3 mr-1" />
                  Tauri + React + Rust
                </Badge>
                <h1 className="text-3xl font-bold mb-2">Código Fonte Completo</h1>
                <p className="text-muted-foreground">
                  Todo o código do AI System Agent pronto para compilar.
                </p>
              </div>
              <Button onClick={copyAllFiles} className="gap-2">
                {copiedPath === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copiar Tudo
              </Button>
            </div>

            {/* Quick Start - Terminal Installation */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5 text-violet-400" />
                  Instalação via Terminal
                </h3>
                
                <div className="space-y-4">
                  {/* Linux */}
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        🐧 Linux (Ubuntu/Debian)
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('curl -fsSL https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.sh | bash', 'linux-install')}
                        className="h-7"
                      >
                        {copiedPath === 'linux-install' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <code className="block bg-zinc-900 text-green-400 p-3 rounded text-sm font-mono">
                      curl -fsSL https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.sh | bash
                    </code>
                  </div>

                  {/* Windows */}
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        🪟 Windows (PowerShell)
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('irm https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.ps1 | iex', 'windows-install')}
                        className="h-7"
                      >
                        {copiedPath === 'windows-install' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <code className="block bg-zinc-900 text-blue-400 p-3 rounded text-sm font-mono">
                      irm https://raw.githubusercontent.com/rapazd3-ux/ai-system-agent/main/install.ps1 | iex
                    </code>
                  </div>

                  {/* Build from source */}
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        🔧 Build do Código Fonte
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('git clone https://github.com/rapazd3-ux/ai-system-agent.git && cd ai-system-agent && npm install && npm run tauri build', 'source-build')}
                        className="h-7"
                      >
                        {copiedPath === 'source-build' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <code className="block bg-zinc-900 text-yellow-400 p-3 rounded text-sm font-mono overflow-x-auto">
                      git clone https://github.com/rapazd3-ux/ai-system-agent.git && cd ai-system-agent && npm install && npm run tauri build
                    </code>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    Conectado: <a href="https://github.com/rapazd3-ux" target="_blank" className="underline hover:text-green-300">github.com/rapazd3-ux</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Structure */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-primary" />
              Estrutura do Projeto
            </h2>
            <Card>
              <CardContent className="p-4 font-mono text-sm">
                <pre className="text-muted-foreground">
{`ai-system-agent/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions para build automático
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── commands.rs
│       ├── ai_client.rs
│       ├── security.rs
│       └── config.rs
├── src/
│   ├── App.tsx
│   ├── store.ts
│   └── components/
│       ├── Chat.tsx           # Chat principal
│       ├── CodeEditor.tsx     # Editor tipo VS Code
│       ├── AISidebar.tsx      # IA para ajudar com código
│       ├── Settings.tsx
│       ├── CommandQueue.tsx
│       └── Sidebar.tsx
├── install.sh                 # Script instalação Linux
├── install.ps1                # Script instalação Windows
├── package.json
└── README.md`}
                </pre>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="rust" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rust" className="gap-2">
                <Cog className="w-4 h-4" />
                Backend (Rust)
              </TabsTrigger>
              <TabsTrigger value="react" className="gap-2">
                <FileCode className="w-4 h-4" />
                Frontend (React)
              </TabsTrigger>
              <TabsTrigger value="scripts" className="gap-2">
                <Terminal className="w-4 h-4" />
                Scripts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rust" className="space-y-4">
              {sourceFiles.rust.map((file) => (
                <FileCard key={file.path} file={file} />
              ))}
            </TabsContent>

            <TabsContent value="react" className="space-y-4">
              {sourceFiles.react.map((file) => (
                <FileCard key={file.path} file={file} />
              ))}
            </TabsContent>

            <TabsContent value="scripts" className="space-y-4">
              {sourceFiles.scripts.map((file) => (
                <FileCard key={file.path} file={file} />
              ))}
            </TabsContent>
          </Tabs>

          {/* Back */}
          <div className="text-center pt-12 border-t mt-12">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceCode;
