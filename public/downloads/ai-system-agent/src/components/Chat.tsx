import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useStore } from '../store';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    addMessage,
    addPendingCommands,
    systemInfo,
    config,
    isLoading,
    setIsLoading,
  } = useStore();

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
      // Get API key
      const apiKey = await invoke<string>('get_api_key', {
        provider: config.default_provider,
      }).catch(() => '');

      if (!apiKey) {
        addMessage({
          role: 'assistant',
          content: `⚠️ **API Key não configurada**\n\nVá em Configurações > API Keys e configure sua chave do ${config.default_provider}.`,
        });
        setIsLoading(false);
        return;
      }

      // Prepare messages for AI
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatMessages.push({ role: 'user', content: userMessage });

      // Send to AI
      const response = await invoke<{
        content: string;
        suggested_commands: any[];
        error?: string;
      }>('send_to_ai', {
        request: {
          provider: config.default_provider,
          model: config.default_model,
          messages: chatMessages,
          system_info: systemInfo
            ? `OS: ${systemInfo.os_version}\nArch: ${systemInfo.arch}\nUser: ${systemInfo.username}@${systemInfo.hostname}`
            : null,
        },
        apiKey,
      });

      if (response.error) {
        addMessage({
          role: 'assistant',
          content: `❌ **Erro:** ${response.error}`,
        });
      } else {
        addMessage({ role: 'assistant', content: response.content });

        // Add suggested commands to queue
        if (response.suggested_commands?.length > 0) {
          addPendingCommands(response.suggested_commands);
        }
      }
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: `❌ **Erro de conexão:** ${error.message || error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Olá! Como posso ajudar?</h2>
              <p className="text-zinc-400 text-sm">
                Descreva o que você quer fazer e eu irei sugerir os comandos necessários.
                Você aprova cada comando antes da execução.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'Instalar Pterodactyl',
                  'Configurar Docker',
                  'Verificar erros no NGINX',
                  'Atualizar sistema',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-zinc-400">Analisando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o que você quer fazer..."
            disabled={isLoading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          ⚠️ Todos os comandos requerem sua aprovação antes da execução
        </p>
      </form>
    </div>
  );
}
