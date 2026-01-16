import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useStore } from '../store';
import { Key, Save, Trash2, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

interface ApiKeyState {
  openai: string;
  google: string;
  anthropic: string;
  xai: string;
}

export function Settings() {
  const { config, setConfig } = useStore();
  const [apiKeys, setApiKeys] = useState<ApiKeyState>({
    openai: '',
    google: '',
    anthropic: '',
    xai: '',
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    // Check which keys are saved
    const providers = ['openai', 'google', 'anthropic', 'xai'];
    providers.forEach(async (provider) => {
      try {
        await invoke('get_api_key', { provider });
        setSavedKeys((prev) => ({ ...prev, [provider]: true }));
      } catch {
        setSavedKeys((prev) => ({ ...prev, [provider]: false }));
      }
    });
  }, []);

  const handleSaveKey = async (provider: string) => {
    const key = apiKeys[provider as keyof ApiKeyState];
    if (!key.trim()) return;

    setSaving(provider);
    try {
      await invoke('save_api_key', { provider, apiKey: key });
      setSavedKeys((prev) => ({ ...prev, [provider]: true }));
      setApiKeys((prev) => ({ ...prev, [provider]: '' }));
    } catch (error) {
      console.error('Error saving key:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    try {
      await invoke('delete_api_key', { provider });
      setSavedKeys((prev) => ({ ...prev, [provider]: false }));
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'] },
    { id: 'google', name: 'Google Gemini', models: ['gemini-pro', 'gemini-1.5-pro'] },
    { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] },
    { id: 'xai', name: 'xAI Grok', models: ['grok-1'] },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Configurações</h2>
          <p className="text-zinc-400">Gerencie suas chaves de API e preferências.</p>
        </div>

        {/* API Keys Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-400" />
            Chaves de API
          </h3>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400 mb-1">Suas chaves são armazenadas com segurança</p>
              <p className="text-zinc-400">
                As chaves são criptografadas e armazenadas no keychain do sistema operacional.
                Nunca são enviadas para nossos servidores.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{provider.name}</span>
                    {savedKeys[provider.id] && (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Configurada
                      </span>
                    )}
                  </div>
                  {savedKeys[provider.id] && (
                    <button
                      onClick={() => handleDeleteKey(provider.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remover chave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      value={apiKeys[provider.id as keyof ApiKeyState]}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          [provider.id]: e.target.value,
                        }))
                      }
                      placeholder={
                        savedKeys[provider.id]
                          ? '••••••••••••••••'
                          : `Cole sua chave ${provider.name} aqui`
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          [provider.id]: !prev[provider.id],
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey(provider.id)}
                    disabled={!apiKeys[provider.id as keyof ApiKeyState].trim() || saving === provider.id}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving === provider.id ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Default Provider */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Provedor Padrão</h3>
          <div className="grid grid-cols-2 gap-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setConfig({
                    ...config,
                    default_provider: provider.id,
                    default_model: provider.models[0],
                  });
                }}
                disabled={!savedKeys[provider.id]}
                className={`p-4 rounded-xl border transition-all ${
                  config.default_provider === provider.id
                    ? 'bg-violet-600/20 border-violet-500'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                } ${!savedKeys[provider.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-medium">{provider.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {savedKeys[provider.id] ? provider.models[0] : 'Chave não configurada'}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
