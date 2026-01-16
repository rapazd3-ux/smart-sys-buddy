import { create } from 'zustand';

interface SystemInfo {
  os: string;
  os_version: string;
  arch: string;
  hostname: string;
  username: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedCommand {
  command: string;
  args: string[];
  description: string;
  requires_sudo: boolean;
  risk_level: 'low' | 'medium' | 'high';
  explanation: string;
}

interface PendingCommand extends SuggestedCommand {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  result?: any;
}

interface Config {
  default_provider: string;
  default_model: string;
  theme: string;
  language: string;
  auto_scroll: boolean;
  confirm_dangerous_commands: boolean;
  max_history_items: number;
}

interface Store {
  // System
  systemInfo: SystemInfo | null;
  setSystemInfo: (info: SystemInfo) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Commands
  pendingCommands: PendingCommand[];
  addPendingCommands: (commands: SuggestedCommand[]) => void;
  updateCommandStatus: (id: string, status: PendingCommand['status'], result?: any) => void;
  removeCommand: (id: string) => void;
  clearCommands: () => void;

  // Config
  config: Config;
  setConfig: (config: Config) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  // System
  systemInfo: null,
  setSystemInfo: (info) => set({ systemInfo: info }),

  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),

  // Commands
  pendingCommands: [],
  addPendingCommands: (commands) =>
    set((state) => ({
      pendingCommands: [
        ...state.pendingCommands,
        ...commands.map((cmd) => ({
          ...cmd,
          id: crypto.randomUUID(),
          status: 'pending' as const,
        })),
      ],
    })),
  updateCommandStatus: (id, status, result) =>
    set((state) => ({
      pendingCommands: state.pendingCommands.map((cmd) =>
        cmd.id === id ? { ...cmd, status, result } : cmd
      ),
    })),
  removeCommand: (id) =>
    set((state) => ({
      pendingCommands: state.pendingCommands.filter((cmd) => cmd.id !== id),
    })),
  clearCommands: () => set({ pendingCommands: [] }),

  // Config
  config: {
    default_provider: 'openai',
    default_model: 'gpt-4-turbo-preview',
    theme: 'dark',
    language: 'pt-BR',
    auto_scroll: true,
    confirm_dangerous_commands: true,
    max_history_items: 100,
  },
  setConfig: (config) => set({ config }),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
