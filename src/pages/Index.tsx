import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Terminal, 
  Bot, 
  CheckCircle, 
  Download, 
  Github,
  Lock,
  Eye,
  Zap,
  Server,
  MessageSquare,
  FileText
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "IA Assistente",
      description: "GPT, Grok e outros modelos analisam seus logs e sugerem correções inteligentes."
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Execução Segura",
      description: "Comandos são executados localmente, apenas após sua aprovação explícita."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Transparente",
      description: "Veja cada comando antes de executar. Nenhuma ação oculta ou acesso remoto."
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Instalação Guiada",
      description: "Instale Docker, Pterodactyl, NGINX e mais com assistência passo a passo."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Análise de Logs",
      description: "Envie logs para a IA diagnosticar erros automaticamente."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Correção Automática",
      description: "Receba sugestões de correção e aplique com um clique."
    }
  ];

  const securityPoints = [
    { icon: <Lock className="w-5 h-5" />, text: "Nenhum comando executado sem aprovação" },
    { icon: <Eye className="w-5 h-5" />, text: "Todos os comandos visíveis antes da execução" },
    { icon: <Shield className="w-5 h-5" />, text: "Nenhum acesso remoto ou backdoor" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Código aberto e auditável" },
  ];

  const steps = [
    { step: "01", title: "Descreva o problema", description: "Digite o que você quer fazer, como 'Instalar Pterodactyl'" },
    { step: "02", title: "Revise os comandos", description: "A IA sugere comandos e você vê cada um antes de executar" },
    { step: "03", title: "Aprove e execute", description: "Clique para aprovar cada comando individualmente" },
    { step: "04", title: "Correção automática", description: "Se houver erro, a IA analisa e sugere correções" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AI System Agent</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Segurança</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Shield className="w-3 h-3 mr-1" />
            100% Local • Código Aberto • Sem Acesso Remoto
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Automação de Sistemas com
            <span className="text-primary"> Inteligência Artificial</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Instale, diagnostique e corrija sistemas complexos como Pterodactyl, Docker e mais. 
            A IA analisa e sugere, você decide e executa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2 text-lg px-8">
              <Download className="w-5 h-5" />
              Download para Windows
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
              <Download className="w-5 h-5" />
              Download para Linux
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Windows 10+
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Ubuntu/Debian
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              macOS
            </span>
          </div>
        </div>
      </section>

      {/* Terminal Preview */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-zinc-500 text-sm">AI System Agent</span>
            </div>
            <CardContent className="p-6 font-mono text-sm">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-semibold">Você:</p>
                    <p className="text-zinc-300">Quero instalar o painel Pterodactyl</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Bot className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-400 font-semibold">AI Agent:</p>
                    <p className="text-zinc-400 mb-3">Detectei Ubuntu 22.04. Aqui estão os comandos necessários:</p>
                    
                    <div className="space-y-2">
                      <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                            SUDO
                          </Badge>
                          <Badge variant="outline" className="text-green-400 border-green-400/30">
                            BAIXO RISCO
                          </Badge>
                        </div>
                        <code className="text-zinc-300">apt update && apt upgrade -y</code>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="text-zinc-400">
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 border-t border-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos Poderosos</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar sistemas complexos com segurança
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 hover:bg-card transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-green-500 border-green-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Segurança Primeiro
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Você está no controle total
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Diferente de ferramentas de acesso remoto, o AI System Agent é um agente 
                <strong> local </strong> que roda no seu computador. A IA apenas analisa e sugere — 
                você decide o que executar.
              </p>

              <div className="space-y-4">
                {securityPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      {point.icon}
                    </div>
                    <span className="font-medium">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border shadow-lg">
              <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Arquitetura de Segurança
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Interface Local</p>
                    <p className="text-muted-foreground">App desktop rodando no seu computador</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">IA Remota (Análise)</p>
                    <p className="text-muted-foreground">GPT/Grok apenas geram sugestões de comandos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Aprovação Obrigatória</p>
                    <p className="text-muted-foreground">Cada comando requer seu clique para executar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Execução Local</p>
                    <p className="text-muted-foreground">Backend local executa apenas comandos aprovados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Processo simples e transparente em 4 passos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/10 mb-4">{step.step}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 w-1/2 border-t border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para automatizar seus sistemas?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Baixe gratuitamente e comece a usar a IA para gerenciar seus servidores com segurança.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg px-8">
              <Download className="w-5 h-5" />
              Download Gratuito
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
              <Github className="w-5 h-5" />
              Ver Código Fonte
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AI System Agent</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Código aberto • Sem telemetria • Sua privacidade é respeitada
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
