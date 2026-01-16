import { MessageSquare, Settings, History, Shield, Terminal } from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'settings';
  setActiveTab: (tab: 'chat' | 'settings') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-8">
        <Terminal className="w-5 h-5" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as 'chat' | 'settings')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === item.id
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-2">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400" title="Seguro">
          <Shield className="w-5 h-5" />
        </div>
      </div>
    </aside>
  );
}
