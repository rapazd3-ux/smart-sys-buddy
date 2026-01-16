import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { 
  Terminal as TerminalIcon, 
  X, 
  Plus, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

interface TerminalTab {
  id: string;
  name: string;
  lines: TerminalLine[];
  currentDir: string;
}

export function IntegratedTerminal() {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', name: 'Terminal 1', lines: [], currentDir: '~' }
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [currentTab?.lines]);

  useEffect(() => {
    // Add welcome message
    addLine('system', '🚀 AI System Agent Terminal v1.0.0');
    addLine('system', 'Digite um comando ou "help" para ver opções disponíveis.\n');
  }, []);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          lines: [...tab.lines, {
            id: Date.now().toString() + Math.random(),
            type,
            content,
            timestamp: new Date()
          }]
        };
      }
      return tab;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    setInput('');
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Show the command
    addLine('input', `$ ${command}`);

    // Handle built-in commands
    if (command === 'clear') {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab ? { ...tab, lines: [] } : tab
      ));
      return;
    }

    if (command === 'help') {
      addLine('system', `
Comandos disponíveis:
  clear     - Limpa o terminal
  help      - Mostra esta ajuda
  exit      - Fecha esta aba do terminal
  
Comandos do sistema (requerem aprovação):
  apt, docker, systemctl, nginx, etc.
  
⚠️ Comandos que modificam o sistema pedem confirmação.
`);
      return;
    }

    if (command === 'exit') {
      if (tabs.length > 1) {
        closeTab(activeTab);
      } else {
        addLine('system', 'Não é possível fechar a última aba do terminal.');
      }
      return;
    }

    setIsExecuting(true);

    try {
      // Parse command and args
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      // Check if needs sudo
      const needsSudo = ['apt', 'apt-get', 'systemctl', 'service'].includes(cmd);

      // Execute command
      const result = await invoke<{
        success: boolean;
        stdout: string;
        stderr: string;
        exit_code: number;
      }>('execute_command', {
        command: cmd,
        args,
        requires_sudo: needsSudo,
        user_confirmed: true // In real app, would show confirmation dialog
      });

      if (result.stdout) {
        addLine('output', result.stdout);
      }
      if (result.stderr) {
        addLine('error', result.stderr);
      }
      if (!result.success) {
        addLine('error', `Processo terminou com código: ${result.exit_code}`);
      }
    } catch (error: any) {
      addLine('error', `Erro: ${error.message || error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs(prev => [...prev, {
      id: newId,
      name: `Terminal ${prev.length + 1}`,
      lines: [],
      currentDir: '~'
    }]);
    setActiveTab(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    
    setTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTab === tabId) {
      const remaining = tabs.filter(t => t.id !== tabId);
      setActiveTab(remaining[0]?.id || '1');
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-400';
      case 'output': return 'text-zinc-300';
      case 'error': return 'text-red-400';
      case 'system': return 'text-violet-400';
      default: return 'text-zinc-300';
    }
  };

  return (
    <div className={`flex flex-col bg-zinc-950 border-t border-zinc-800 ${isMaximized ? 'h-96' : 'h-48'}`}>
      {/* Tab Bar */}
      <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TerminalIcon className="w-3 h-3" />
              {tab.name}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="hover:bg-zinc-700 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
          <button
            onClick={addTab}
            className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm cursor-text"
      >
        {currentTab?.lines.map(line => (
          <div key={line.id} className={`${getLineColor(line.type)} whitespace-pre-wrap break-all`}>
            {line.content}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="text-green-400">
            {currentTab?.currentDir}
            <span className="text-violet-400">$</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent text-zinc-100 outline-none"
            autoFocus
          />
          {isExecuting && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
        </form>
      </div>
    </div>
  );
}
