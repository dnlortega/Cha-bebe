"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Globe, 
  Database, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Palette,
  Code2,
  CheckCircle2,
  Info,
  Server,
  Fingerprint,
  Sparkles,
  LayoutTemplate
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const techStack = [
  { name: "Next.js", version: "16.2.6", icon: Globe, description: "Framework React para produção com App Router" },
  { name: "React", version: "19.2.4", icon: Code2, description: "Biblioteca principal para interface do usuário" },
  { name: "Tailwind CSS", version: "4.0", icon: Palette, description: "Estilização utilitária de alta performance" },
  { name: "Prisma ORM", version: "6.4.1", icon: Database, description: "Modelagem e acesso ao banco de dados" },
  { name: "PostgreSQL", version: "Neon Tech", icon: Server, description: "Banco de dados relacional serverless" },
  { name: "Shadcn UI", version: "Latest", icon: Layers, description: "Componentes de interface acessíveis e elegantes" },
  { name: "Base UI", version: "1.4.1", icon: Layers, description: "Componentes headless com acessibilidade avançada" },
  { name: "Framer Motion", version: "12.38.0", icon: Sparkles, description: "Biblioteca de animações fluidas" },
  { name: "Sonner", version: "2.0.7", icon: Info, description: "Sistema de notificações toast elegantes" },
  { name: "Canvas Confetti", version: "1.9.4", icon: Palette, description: "Efeitos de celebração interativos" },
  { name: "Lucide React", version: "1.14.0", icon: Zap, description: "Conjunto de ícones premium e consistentes" },
];

const features = [
  "Mural Live Inteligente para Telão e TVs",
  "Gestão Dinâmica de Lista de Presentes (Reserva Única)",
  "Gerador de Convite Direto pelo WhatsApp",
  "Tematização Dinâmica por Sexo e Nome do Bebê",
  "Sistema Dinâmico de Tipografia (Admin vs Convite)",
  "Exibição de Data, Local e Link do Maps",
  "Sistema de RSVP Individual e Familiar",
  "Distribuição Automática de Tamanhos de Fralda e Kit Churrasco",
  "Gestão Administrativa com Sidebar Intuitiva",
  "Performance Real-time Otimizada (Zero Cache)",
  "Interface Mobile-First de Alto Luxo"
];

function ClassicDesign() {
  return (
    <div className="max-w-6xl space-y-12 animate-in fade-in duration-700 pb-20 mt-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">Sobre o Sistema</h1>
        <p className="text-stone-500 text-lg max-w-2xl">
          Uma plataforma de gestão de eventos desenvolvida com as tecnologias mais recentes do ecossistema web.
        </p>
      </header>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-stone-500 leading-relaxed">
            <p>
              Este sistema proporciona uma experiência fluida para organizadores e convidados. A arquitetura é 100% real-time (zero cache), garantindo que atualizações apareçam instantaneamente.
            </p>
            <p>
              Utiliza Prisma como ORM conectado a um banco de dados PostgreSQL hospedado na Neon Tech, garantindo escalabilidade e performance excepcional.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-stone-500 leading-relaxed">
             <p>
                O sistema implementa proteção de sessão com logout automático, credenciais seguras e verificação rigorosa de autenticação para todas as requisições de modificação.
             </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Tecnologias Utilizadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <Card key={tech.name} className="flex flex-col shadow-sm border-stone-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <tech.icon className="h-5 w-5 text-stone-700 mb-2" />
                  <Badge variant="secondary" className="font-mono text-[10px]">{tech.version}</Badge>
                </div>
                <CardTitle className="text-base text-stone-900">{tech.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-stone-500">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Funcionalidades</h2>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 opacity-70" />
                  <span className="text-sm text-stone-600">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PremiumDesign() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-20 pb-24 mt-12"
    >
      <motion.header variants={itemVariants} className="space-y-6 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
           <div className="h-px w-16 bg-primary" />
           <p className="text-xs text-primary font-medium tracking-[0.4em] uppercase">System Architecture</p>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif text-stone-900 tracking-tight leading-tight">
            Sobre o <br/><span className="text-primary italic">Sistema</span>
          </h1>
          <p className="mt-6 text-sm text-stone-500 tracking-[0.2em] font-light uppercase max-w-2xl leading-relaxed">
            Uma plataforma de gestão de eventos de alto padrão, desenvolvida com as tecnologias mais recentes do ecossistema web para garantir performance extrema e design luxuoso.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        <div className="xl:col-span-8 space-y-16">
          <motion.section variants={itemVariants} className="relative bg-white/60 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors duration-700">
              <Cpu className="h-40 w-40 transform rotate-12" />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-serif tracking-[0.3em] text-primary uppercase flex items-center gap-3 mb-8">
                <Info className="h-4 w-4" />
                Visão Geral
              </h2>
              <div className="space-y-6 text-sm md:text-base font-light text-stone-600 leading-relaxed max-w-3xl">
                <p>
                  Este sistema foi concebido para proporcionar uma <strong className="font-medium text-stone-900">experiência de luxo</strong> tanto para os organizadores quanto para os convidados. 
                  A arquitetura agora é 100% real-time (zero cache), garantindo que qualquer confirmação ou mensagem no mural apareça instantaneamente.
                </p>
                <p>
                  A gestão de dados utiliza o Prisma como ORM, conectado a um banco de dados PostgreSQL hospedado na Neon Tech. 
                  Tudo foi projetado para oferecer escalabilidade, performance excepcional e um visual impecável, perfeito para um evento inesquecível.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="space-y-8">
            <h2 className="text-sm font-serif tracking-[0.3em] text-primary uppercase pl-2">Tecnologias Utilizadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
              {techStack.map((tech) => (
                <motion.div 
                  key={tech.name} 
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="h-full border-stone-200/50 bg-white/50 backdrop-blur-sm rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-stone-100/80 rounded-xl text-stone-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <tech.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="bg-stone-100 text-stone-600 group-hover:bg-primary group-hover:text-white transition-colors text-[10px] uppercase font-semibold tracking-wider">
                          {tech.version}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-stone-900">{tech.name}</h3>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">{tech.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <motion.section variants={itemVariants} className="bg-stone-950 text-stone-300 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-20 -right-20 text-white/5 group-hover:text-white/10 transition-colors duration-700">
               <Zap className="h-64 w-64 transform -rotate-12" />
            </div>
            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-sm font-serif tracking-[0.3em] text-white uppercase mb-2">Funcionalidades</h2>
                <p className="text-[10px] text-stone-500 tracking-[0.2em] uppercase font-light">Key Features Implemented</p>
              </div>
              <ul className="space-y-5">
                {features.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5 opacity-80" />
                    <span className="text-xs tracking-wide leading-relaxed font-light text-stone-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-8 md:p-10 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
               <Fingerprint className="h-24 w-24" />
             </div>
             <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Segurança & Sessão</h2>
               </div>
               <p className="text-xs text-stone-600 leading-relaxed font-light">
                  O sistema implementa um mecanismo de proteção de sessão com logout automático por inatividade, 
                  configurável no painel visual. As credenciais são armazenadas com segurança e todas as requisições 
                  de modificação passam por verificação rigorosa de autenticação.
               </p>
             </div>
          </motion.section>
        </div>
      </div>

      <motion.footer variants={itemVariants} className="pt-16 mt-16 border-t border-stone-200 text-center relative">
         <div className="absolute left-1/2 -top-px -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
         <p className="text-[10px] tracking-[0.5em] text-stone-400 uppercase font-light">
            Desenvolvido com Precisão • {new Date().getFullYear()}
         </p>
      </motion.footer>
    </motion.div>
  );
}

export default function AboutPage() {
  const [designStyle, setDesignStyle] = useState<"premium" | "classic">("premium");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Seletor de Design */}
      <div className="flex justify-end pt-6 relative z-50">
        <div className="bg-stone-100/80 backdrop-blur-md p-1 rounded-xl flex gap-1 shadow-sm border border-stone-200/50">
          <Button 
            variant={designStyle === "classic" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setDesignStyle("classic")}
            className={`text-xs rounded-lg transition-all ${designStyle === "classic" ? "shadow-md" : "text-stone-500 hover:text-stone-900"}`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 mr-2" /> Clássico
          </Button>
          <Button 
            variant={designStyle === "premium" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setDesignStyle("premium")}
            className={`text-xs rounded-lg transition-all ${designStyle === "premium" ? "shadow-md" : "text-stone-500 hover:text-stone-900"}`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" /> Premium
          </Button>
        </div>
      </div>

      {/* Conteúdo Renderizado baseado na escolha */}
      {designStyle === "premium" ? <PremiumDesign /> : <ClassicDesign />}
    </div>
  );
}
