import { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown,
  X,
  Plus,
  Save,
  Play,
  Search,
  Settings,
  GitBranch,
  Folder
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

const initialFiles: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'main.rs', type: 'file', content: 'fn main() {\n    println!("Hello, world!");\n}' },
      { name: 'lib.rs', type: 'file', content: '// Library code here' },
    ],
  },
  {
    name: 'Cargo.toml',
    type: 'file',
    content: '[package]\nname = "my-project"\nversion = "0.1.0"\nedition = "2021"',
  },
  { name: 'README.md', type: 'file', content: '# My Project\n\nDescription here...' },
];

interface OpenTab {
  name: string;
  path: string;
  content: string;
  modified: boolean;
}

export function CodeEditor() {
  const [files] = useState<FileNode[]>(initialFiles);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const openFile = (name: string, path: string, content: string) => {
    const existing = openTabs.find((t) => t.path === path);
    if (!existing) {
      setOpenTabs((prev) => [...prev, { name, path, content, modified: false }]);
    }
    setActiveTab(path);
    setEditorContent(content);
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((t) => t.path !== path));
    if (activeTab === path) {
      const remaining = openTabs.filter((t) => t.path !== path);
      if (remaining.length > 0) {
        setActiveTab(remaining[remaining.length - 1].path);
        setEditorContent(remaining[remaining.length - 1].content);
      } else {
        setActiveTab(null);
        setEditorContent('');
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    setOpenTabs((prev) =>
      prev.map((t) =>
        t.path === activeTab ? { ...t, content: newContent, modified: true } : t
      )
    );
  };

  useEffect(() => {
    const tab = openTabs.find((t) => t.path === activeTab);
    if (tab) {
      setEditorContent(tab.content);
    }
  }, [activeTab]);

  const renderFileTree = (nodes: FileNode[], path = '') => {
    return nodes.map((node) => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(fullPath);

      if (node.type === 'folder') {
        return (
          <div key={fullPath}>
            <button
              onClick={() => toggleFolder(fullPath)}
              className="w-full flex items-center gap-1 px-2 py-1 hover:bg-zinc-700/50 text-sm text-zinc-300"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              <Folder className="w-4 h-4 text-yellow-500" />
              <span>{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div className="ml-4">{renderFileTree(node.children, fullPath)}</div>
            )}
          </div>
        );
      }

      return (
        <button
          key={fullPath}
          onClick={() => openFile(node.name, fullPath, node.content || '')}
          className={`w-full flex items-center gap-1 px-2 py-1 hover:bg-zinc-700/50 text-sm ${
            activeTab === fullPath ? 'bg-zinc-700/70 text-white' : 'text-zinc-300'
          }`}
        >
          <File className="w-4 h-4 text-zinc-500 ml-5" />
          <span>{node.name}</span>
        </button>
      );
    });
  };

  const getLanguage = (filename: string): string => {
    if (filename.endsWith('.rs')) return 'rust';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.toml')) return 'toml';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900">
      {/* Editor Toolbar */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
            <Save className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-700" />
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
            <Play className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
            <GitBranch className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-56 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
          <div className="p-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Explorer
          </div>
          <div className="px-1">{renderFileTree(files)}</div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="h-9 bg-zinc-850 border-b border-zinc-800 flex items-center overflow-x-auto">
            {openTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => setActiveTab(tab.path)}
                className={`h-full px-3 flex items-center gap-2 border-r border-zinc-800 text-sm ${
                  activeTab === tab.path
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <File className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
                {tab.modified && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                <button
                  onClick={(e) => closeTab(tab.path, e)}
                  className="p-0.5 hover:bg-zinc-700 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab ? (
              <div className="h-full flex">
                {/* Line Numbers */}
                <div className="w-12 bg-zinc-900 border-r border-zinc-800 text-right pr-3 pt-2 text-xs text-zinc-600 font-mono select-none overflow-hidden">
                  {editorContent.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Editor */}
                <textarea
                  ref={textareaRef}
                  value={editorContent}
                  onChange={handleContentChange}
                  className="flex-1 bg-zinc-900 text-zinc-100 font-mono text-sm leading-6 p-2 resize-none focus:outline-none overflow-auto"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Abra um arquivo para começar a editar</p>
                  <p className="text-sm mt-2 text-zinc-700">
                    Use o explorador à esquerda ou Ctrl+O
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="h-6 bg-violet-600 flex items-center justify-between px-3 text-xs text-white">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                main
              </span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              {activeTab && <span>{getLanguage(activeTab)}</span>}
              <span>Ln 1, Col 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
