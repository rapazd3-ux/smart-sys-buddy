import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Terminal, 
  ArrowLeft,
  Copy,
  Check,
  Download,
  MonitorSmartphone,
  HardDrive,
  Cpu,
  Key,
  Shield,
  AlertTriangle,
  CheckCircle,
  Github
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Docs = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const requirements = {
    windows: [
      { label: "Windows 10/11 (64-bit)", icon: <MonitorSmartphone className="w-4 h-4" /> },
      { label: "4GB RAM mínimo", icon: <Cpu className="w-4 h-4" /> },
      { label: "500MB espaço em disco", icon: <HardDrive className="w-4 h-4" /> },
      { label: "Conexão com internet", icon: <CheckCircle className="w-4 h-4" /> },
    ],
    linux: [
      { label: "Ubuntu 20.04+ / Debian 11+", icon: <MonitorSmartphone className="w-4 h-4" /> },
      { label: "4GB RAM mínimo", icon: <Cpu className="w-4 h-4" /> },
      { label: "500MB espaço em disco", icon: <HardDrive className="w-4 h-4" /> },
      { label: "libwebkit2gtk-4.0", icon: <CheckCircle className="w-4 h-4" /> },
    ],
  };

  const installCommands = [
    {
      title: "Linux (Ubuntu/Debian) - Via .deb",
      commands: [
        "# Baixar o pacote .deb",
        "wget https://github.com/ai-system-agent/releases/latest/download/ai-system-agent_1.0.0_amd64.deb",
        "",
        "# Instalar o pacote",
        "sudo dpkg -i ai-system-agent_1.0.0_amd64.deb",
        "",
        "# Resolver dependências (se necessário)",
        "sudo apt-get install -f",
      ],
    },
    {
      title: "Linux - Via Terminal (Build from source)",
      commands: [
        "# Instalar dependências",
        "sudo apt update",
        "sudo apt install -y libwebkit2gtk-4.0-dev build-essential curl wget",
        "",
        "# Instalar Rust",
        "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
        "source $HOME/.cargo/env",
        "",
        "# Clonar e compilar",
        "git clone https://github.com/ai-system-agent/ai-system-agent.git",
        "cd ai-system-agent",
        "cargo tauri build",
        "",
        "# O binário estará em target/release/ai-system-agent",
      ],
    },
    {
      title: "Windows - Instalador",
      commands: [
        "# Opção 1: Baixar o instalador .msi",
        "# Acesse: https://github.com/ai-system-agent/releases/latest",
        "# Baixe: ai-system-agent_1.0.0_x64.msi",
        "# Execute o instalador e siga as instruções",
        "",
        "# Opção 2: Via winget (quando disponível)",
        "winget install ai-system-agent",
      ],
    },
  ];

  const faqs = [
    {
      question: "É seguro usar este aplicativo?",
      answer: "Sim! O AI System Agent foi projetado com segurança em primeiro lugar. Nenhum comando é executado sem sua aprovação explícita. Você vê exatamente o que será executado antes de confirmar. O código é open-source e pode ser auditado por qualquer pessoa."
    },
    {
      question: "Quais modelos de IA são suportados?",
      answer: "Atualmente suportamos OpenAI GPT-4/GPT-3.5, Google Gemini, Anthropic Claude, e xAI Grok. Você pode adicionar sua própria chave de API nas configurações do aplicativo."
    },
    {
      question: "Preciso de uma chave de API?",
      answer: "Sim, você precisa fornecer sua própria chave de API do provedor de IA que deseja usar. Isso garante que você tem controle total sobre o uso e os custos. A chave é armazenada localmente e criptografada."
    },
    {
      question: "O aplicativo envia dados para servidores externos?",
      answer: "O único dado enviado externamente é o texto da sua conversa com a IA (para o provedor escolhido). Logs e arquivos só são enviados se você explicitamente autorizar. Nenhum dado é enviado para nossos servidores."
    },
    {
      question: "Posso usar offline?",
      answer: "A interface funciona offline, mas para as funcionalidades de IA você precisa de conexão com internet para se comunicar com os provedores de IA."
    },
    {
      question: "Como atualizo o aplicativo?",
      answer: "O aplicativo verifica atualizações automaticamente. Quando uma nova versão estiver disponível, você será notificado e poderá atualizar com um clique."
    },
    {
      question: "Posso contribuir com o projeto?",
      answer: "Sim! O projeto é open-source. Você pode contribuir reportando bugs, sugerindo melhorias ou enviando pull requests no GitHub."
    },
    {
      question: "Como configuro a chave da API?",
      answer: "Ao abrir o aplicativo pela primeira vez, você será guiado para configurar sua chave de API. Você também pode acessar Configurações > API Keys a qualquer momento para adicionar ou modificar suas chaves."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Documentação</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Terminal className="w-3 h-3 mr-1" />
              v1.0.0
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Documentação Técnica</h1>
            <p className="text-xl text-muted-foreground">
              Guia completo de instalação, requisitos e perguntas frequentes.
            </p>
          </motion.div>

          {/* System Requirements */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              Requisitos do Sistema
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MonitorSmartphone className="w-5 h-5" />
                    Windows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.windows.map((req, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {req.icon}
                        </div>
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Linux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.linux.map((req, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {req.icon}
                        </div>
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Installation Guide */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              Guia de Instalação
            </h2>

            <div className="space-y-6">
              {installCommands.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>
                          {section.commands.map((cmd, cmdIndex) => (
                            <div 
                              key={cmdIndex} 
                              className={cmd.startsWith("#") ? "text-zinc-500" : "text-green-400"}
                            >
                              {cmd || "\n"}
                            </div>
                          ))}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-100"
                        onClick={() => copyToClipboard(section.commands.join("\n"), sectionIndex)}
                      >
                        {copiedIndex === sectionIndex ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* API Key Configuration */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Configuração da Chave de API
            </h2>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Importante</p>
                      <p className="text-sm text-muted-foreground">
                        Você precisa de uma chave de API válida de um dos provedores suportados (OpenAI, Google, Anthropic, xAI). 
                        A chave é armazenada localmente e nunca é compartilhada.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Passos para configurar:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Abra o aplicativo e clique em <code className="bg-muted px-1.5 py-0.5 rounded">Configurações</code></li>
                      <li>Navegue até <code className="bg-muted px-1.5 py-0.5 rounded">API Keys</code></li>
                      <li>Selecione o provedor desejado (OpenAI, Gemini, Claude, Grok)</li>
                      <li>Cole sua chave de API e clique em <code className="bg-muted px-1.5 py-0.5 rounded">Salvar</code></li>
                      <li>A chave será criptografada e armazenada localmente</li>
                    </ol>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500/10 text-green-500 rounded flex items-center justify-center text-xs">✓</span>
                        OpenAI
                      </h5>
                      <p className="text-sm text-muted-foreground">GPT-4, GPT-3.5 Turbo</p>
                      <a href="https://platform.openai.com/api-keys" target="_blank" className="text-sm text-primary hover:underline">
                        Obter chave →
                      </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center text-xs">✓</span>
                        Google
                      </h5>
                      <p className="text-sm text-muted-foreground">Gemini Pro, Gemini Ultra</p>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-sm text-primary hover:underline">
                        Obter chave →
                      </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-orange-500/10 text-orange-500 rounded flex items-center justify-center text-xs">✓</span>
                        Anthropic
                      </h5>
                      <p className="text-sm text-muted-foreground">Claude 3 Opus, Sonnet</p>
                      <a href="https://console.anthropic.com/" target="_blank" className="text-sm text-primary hover:underline">
                        Obter chave →
                      </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-500/10 text-purple-500 rounded flex items-center justify-center text-xs">✓</span>
                        xAI
                      </h5>
                      <p className="text-sm text-muted-foreground">Grok-1, Grok-2</p>
                      <a href="https://x.ai/" target="_blank" className="text-sm text-primary hover:underline">
                        Obter chave →
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Security */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Segurança
            </h2>

            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      O que fazemos
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        Exibimos cada comando antes de executar
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        Requeremos aprovação explícita para cada ação
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        Armazenamos chaves de API criptografadas
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        Mantemos logs visíveis de todas as ações
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        Código 100% open-source e auditável
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      O que NÃO fazemos
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✕</span>
                        Executar comandos sem sua permissão
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✕</span>
                        Enviar arquivos sem consentimento
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✕</span>
                        Abrir portas ou permitir acesso remoto
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✕</span>
                        Coletar telemetria ou dados de uso
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">✕</span>
                        Armazenar dados em servidores externos
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* FAQ */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes (FAQ)</h2>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>

          {/* Back to Home */}
          <div className="text-center pt-8 border-t">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
