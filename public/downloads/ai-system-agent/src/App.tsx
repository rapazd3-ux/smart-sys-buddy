import { useState, useEffect, useRef } from 'react';
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
    // Get system info on startup
    invoke('get_system_info').then((info: any) => {
      setSystemInfo(info);
    }).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold">AI System Agent</h1>
              {systemInfo && (
                <p className="text-xs text-zinc-500">
                  {systemInfo.os_version} • {systemInfo.hostname}
                </p>
              )}
            </div>
          </div>

          {pendingCommands.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm text-yellow-400">
                {pendingCommands.length} comando(s) pendente(s)
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex">
              <Chat />
              {pendingCommands.length > 0 && <CommandQueue />}
            </div>
          )}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
