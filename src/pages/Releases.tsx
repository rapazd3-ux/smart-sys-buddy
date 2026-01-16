import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Download, 
  Github,
  Terminal,
  Monitor,
  Apple,
  Clock,
  FileCode,
  CheckCircle,
  Menu,
  ArrowLeft,
  Package,
  HardDrive
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Release {
  version: string;
  date: string;
  isLatest: boolean;
  changelog: string[];
  assets: {
    name: string;
    platform: 'windows' | 'linux' | 'macos';
    size: string;
    downloadUrl: string;
  }[];
}

const releases: Release[] = [
  {
    version: "1.0.0",
    date: "2025-01-16",
    isLatest: true,
    changelog: [
      "Lançamento inicial",
      "Editor de código integrado com IA",
      "Terminal com múltiplas abas",
      "Sistema de extensões",
      "Chat com assistente IA",
      "Suporte a Windows e Linux"
    ],
    assets: [
      {
        name: "ai-system-agent_1.0.0_x64_en-US.msi",
        platform: 'windows',
        size: "~45 MB",
        downloadUrl: "https://github.com/rapazd3-ux/ai-system-agent/releases/download/v1.0.0/ai-system-agent_1.0.0_x64_en-US.msi"
      },
      {
        name: "ai-system-agent_1.0.0_amd64.deb",
        platform: 'linux',
        size: "~40 MB",
        downloadUrl: "https://github.com/rapazd3-ux/ai-system-agent/releases/download/v1.0.0/ai-system-agent_1.0.0_amd64.deb"
      },
      {
        name: "ai-system-agent_1.0.0_amd64.AppImage",
        platform: 'linux',
        size: "~42 MB",
        downloadUrl: "https://github.com/rapazd3-ux/ai-system-agent/releases/download/v1.0.0/ai-system-agent_1.0.0_amd64.AppImage"
      }
    ]
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'windows':
      return <Monitor className="w-4 h-4" />;
    case 'linux':
      return <Terminal className="w-4 h-4" />;
    case 'macos':
      return <Apple className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getPlatformName = (platform: string) => {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'macOS';
    default:
      return platform;
  }
};

const Releases = () => {
  const NavLinks = () => (
    <>
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</Link>
      <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
      <Link to="/source-code" className="text-muted-foreground hover:text-foreground transition-colors">Código Fonte</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div 
              className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="font-bold text-xl">AI System Agent</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a href="https://github.com/rapazd3-ux/ai-system-agent" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </a>
            </motion.div>
          </nav>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <a href="https://github.com/rapazd3-ux/ai-system-agent" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 w-full">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Button>
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Download className="w-3 h-3 mr-1" />
                Downloads
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Releases</h1>
              <p className="text-xl text-muted-foreground">
                Baixe a versão mais recente do AI System Agent
              </p>
            </div>

            {/* Quick Download Section */}
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Rápido via Terminal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Linux/macOS:
                  </p>
                  <div className="bg-zinc-950 rounded-lg p-3 font-mono text-sm text-zinc-300 overflow-x-auto">
                    <code>curl -sSL https://github.com/rapazd3-ux/ai-system-agent/releases/latest/download/install.sh | bash</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Windows (PowerShell):
                  </p>
                  <div className="bg-zinc-950 rounded-lg p-3 font-mono text-sm text-zinc-300 overflow-x-auto">
                    <code>irm https://github.com/rapazd3-ux/ai-system-agent/releases/latest/download/install.ps1 | iex</code>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Os scripts de instalação estarão disponíveis após o primeiro build via GitHub Actions
                </p>
              </CardContent>
            </Card>

            {/* Releases List */}
            <div className="space-y-6">
              {releases.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">v{release.version}</CardTitle>
                          {release.isLatest && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                              Mais Recente
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          {new Date(release.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Changelog */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Changelog
                        </h4>
                        <ul className="space-y-2">
                          {release.changelog.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Assets */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Downloads
                        </h4>
                        <div className="grid gap-3">
                          {release.assets.map((asset, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <a
                                href={asset.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    {getPlatformIcon(asset.platform)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{asset.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {getPlatformName(asset.platform)} • {asset.size}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="gap-2">
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </a>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Build Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Compilar do Código Fonte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Prefere compilar você mesmo? Clone o repositório e siga as instruções:
                </p>
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-300 space-y-2">
                  <p><span className="text-green-400">#</span> Clone o repositório</p>
                  <p>git clone https://github.com/rapazd3-ux/ai-system-agent.git</p>
                  <p>cd ai-system-agent</p>
                  <p className="mt-4"><span className="text-green-400">#</span> Instale as dependências</p>
                  <p>npm install</p>
                  <p className="mt-4"><span className="text-green-400">#</span> Compile para sua plataforma</p>
                  <p>npm run tauri build</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link to="/docs">
                    <Button variant="outline" className="gap-2">
                      <FileCode className="w-4 h-4" />
                      Documentação Completa
                    </Button>
                  </Link>
                  <Link to="/source-code">
                    <Button variant="outline" className="gap-2">
                      <Terminal className="w-4 h-4" />
                      Ver Código Fonte
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <span className="font-semibold">AI System Agent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Código aberto • Seguro • Local
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Releases;
