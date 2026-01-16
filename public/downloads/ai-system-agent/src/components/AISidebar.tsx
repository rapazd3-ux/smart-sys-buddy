import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useStore } from '../store';
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles, 
  Code2, 
  Bug, 
  Lightbulb,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AISidebar() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config } = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    { icon: Code2, label: 'Explicar código', prompt: 'Explique este código:' },
    { icon: Bug, label: 'Encontrar bugs', prompt: 'Encontre bugs neste código:' },
    { icon: Lightbulb, label: 'Sugerir melhorias', prompt: 'Sugira melhorias para:' },
    { icon: RefreshCw, label: 'Refatorar', prompt: 'Refatore este código:' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = await invoke<string>('get_api_key', {
        provider: config.default_provider,
      }).catch(() => '');

      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: '⚠️ Configure sua API Key nas configurações para usar a IA.',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatMessages.push({ role: 'user', content: userMessage.content });

      const response = await invoke<{ content: string; error?: string }>('send_to_ai', {
        request: {
          provider: config.default_provider,
          model: config.default_model,
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente de programação especializado. Ajude com código, debugging, explicações técnicas e sugestões de melhorias. Seja conciso e direto.',
            },
            ...chatMessages,
          ],
          system_info: null,
        },
        apiKey,
      });

      if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ Erro: ${response.error}`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Erro: ${error.message || error}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt + ' ');
  };

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Assistente IA</h3>
          <p className="text-xs text-zinc-500">Ajuda com código</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-zinc-800">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 transition-colors"
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              Pergunte sobre seu código ou use as ações rápidas acima
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3 h-3" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              {message.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  {copiedId === message.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </button>
              )}
            </div>
            {message.role === 'user' && (
              <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3" />
            </div>
            <div className="bg-zinc-800 rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre código..."
            disabled={isLoading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
