import { useState } from 'react';
import {
  Puzzle,
  Search,
  Download,
  Check,
  Star,
  Settings,
  Trash2,
  ExternalLink,
  Code2,
  Palette,
  Terminal,
  FileCode,
  Sparkles,
  GitBranch,
  Bug,
  Zap
} from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  icon: React.ComponentType<any>;
  category: 'language' | 'theme' | 'tool' | 'ai';
  installed: boolean;
  enabled: boolean;
}

const availableExtensions: Extension[] = [
  {
    id: 'rust-analyzer',
    name: 'Rust Analyzer',
    description: 'Suporte avançado para Rust com autocomplete, go to definition e diagnósticos',
    author: 'rust-lang',
    version: '0.4.1823',
    downloads: 1250000,
    rating: 4.9,
    icon: Code2,
    category: 'language',
    installed: true,
    enabled: true,
  },
  {
    id: 'python',
    name: 'Python',
    description: 'IntelliSense, linting, debugging e formatação para Python',
    author: 'Microsoft',
    version: '2024.1.0',
    downloads: 89000000,
    rating: 4.8,
    icon: FileCode,
    category: 'language',
    installed: false,
    enabled: false,
  },
  {
    id: 'ai-assistant',
    name: 'AI Code Assistant',
    description: 'Assistente de IA integrado para sugestões de código e refatoração',
    author: 'AI System Agent',
    version: '1.0.0',
    downloads: 50000,
    rating: 4.7,
    icon: Sparkles,
    category: 'ai',
    installed: true,
    enabled: true,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'Seu programador par com IA. Sugestões de código em tempo real',
    author: 'GitHub',
    version: '1.156.0',
    downloads: 12000000,
    rating: 4.6,
    icon: Zap,
    category: 'ai',
    installed: false,
    enabled: false,
  },
  {
    id: 'dracula-theme',
    name: 'Dracula Theme',
    description: 'Tema escuro oficial do Dracula para o editor',
    author: 'Dracula Theme',
    version: '2.24.3',
    downloads: 6500000,
    rating: 4.9,
    icon: Palette,
    category: 'theme',
    installed: false,
    enabled: false,
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    description: 'Tema baseado no Atom One Dark',
    author: 'binaryify',
    version: '3.16.0',
    downloads: 8200000,
    rating: 4.8,
    icon: Palette,
    category: 'theme',
    installed: true,
    enabled: true,
  },
  {
    id: 'git-lens',
    name: 'GitLens',
    description: 'Superpoderes do Git no seu editor. Blame, histórico e muito mais',
    author: 'GitKraken',
    version: '14.7.0',
    downloads: 32000000,
    rating: 4.7,
    icon: GitBranch,
    category: 'tool',
    installed: true,
    enabled: true,
  },
  {
    id: 'debug-console',
    name: 'Debug Console Pro',
    description: 'Console de debug avançado com breakpoints e inspeção de variáveis',
    author: 'Debug Tools',
    version: '2.1.0',
    downloads: 450000,
    rating: 4.5,
    icon: Bug,
    category: 'tool',
    installed: false,
    enabled: false,
  },
  {
    id: 'terminal-plus',
    name: 'Terminal++',
    description: 'Terminal integrado com suporte a múltiplas sessões e temas',
    author: 'Terminal Team',
    version: '1.5.0',
    downloads: 780000,
    rating: 4.6,
    icon: Terminal,
    category: 'tool',
    installed: true,
    enabled: true,
  },
];

export function ExtensionManager() {
  const [extensions, setExtensions] = useState(availableExtensions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const categories = [
    { id: null, label: 'Todas', icon: Puzzle },
    { id: 'language', label: 'Linguagens', icon: Code2 },
    { id: 'theme', label: 'Temas', icon: Palette },
    { id: 'tool', label: 'Ferramentas', icon: Settings },
    { id: 'ai', label: 'IA', icon: Sparkles },
  ];

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ext.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedExtensions = extensions.filter(e => e.installed);

  const toggleInstall = async (id: string) => {
    const ext = extensions.find(e => e.id === id);
    if (!ext) return;

    if (!ext.installed) {
      setInstallingId(id);
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setExtensions(prev => prev.map(e => 
      e.id === id 
        ? { ...e, installed: !e.installed, enabled: !e.installed } 
        : e
    ));
    setInstallingId(null);
  };

  const toggleEnabled = (id: string) => {
    setExtensions(prev => prev.map(e =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ));
  };

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="flex h-full bg-zinc-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-violet-400" />
            Extensões
          </h2>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar extensões..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-2 py-1">
          {categories.map(cat => (
            <button
              key={cat.id || 'all'}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Installed */}
        <div className="mt-auto p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Instaladas</p>
          <p className="text-2xl font-bold">{installedExtensions.length}</p>
          <p className="text-xs text-zinc-500">
            {installedExtensions.filter(e => e.enabled).length} ativas
          </p>
        </div>
      </div>

      {/* Extension List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredExtensions.map(ext => (
            <div
              key={ext.id}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  ext.category === 'ai' ? 'bg-violet-600/20 text-violet-400' :
                  ext.category === 'theme' ? 'bg-pink-600/20 text-pink-400' :
                  ext.category === 'language' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  <ext.icon className="w-6 h-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{ext.name}</h3>
                    <span className="text-xs text-zinc-500">v{ext.version}</span>
                    {ext.installed && ext.enabled && (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-2 line-clamp-2">{ext.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{ext.author}</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {formatDownloads(ext.downloads)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {ext.rating}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {ext.installed ? (
                    <>
                      <button
                        onClick={() => toggleEnabled(ext.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          ext.enabled
                            ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {ext.enabled ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => toggleInstall(ext.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                        title="Desinstalar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleInstall(ext.id)}
                      disabled={installingId === ext.id}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      {installingId === ext.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Instalando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Instalar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredExtensions.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma extensão encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
