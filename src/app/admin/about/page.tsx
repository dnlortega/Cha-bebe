"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MonitorSmartphone,
  BarChart3,
  ExternalLink,
  Rocket,
  Bell,
  History,
  Lock,
  Users,
  Gift,
  MessageSquare,
  Eye,
  Smartphone,
  CalendarDays,
  Layout,
  Share2,
  Map
} from "lucide-react";

const techStack = [
  { name: "Next.js", version: "16.2.6", icon: Globe, description: "App Router, Server Actions, Turbopack e renderização híbrida SSR/SSG" },
  { name: "React", version: "19.2.4", icon: Code2, description: "Componentes concorrentes, hooks modernos e Suspense nativo" },
  { name: "Tailwind CSS", version: "4.x JIT", icon: Palette, description: "Motor de estilização JIT ultra-rápido com variáveis CSS nativas" },
  { name: "Prisma ORM", version: "6.4.1", icon: Database, description: "Type-safe queries, migrations e client gerado automaticamente" },
  { name: "PostgreSQL", version: "Neon Serverless", icon: Server, description: "Banco de dados serverless com escalonamento automático e branching" },
  { name: "Shadcn/UI + Base UI", version: "4.7.0", icon: Layers, description: "Componentes headless com acessibilidade WAI-ARIA completa" },
  { name: "Framer Motion", version: "12.38.0", icon: Sparkles, description: "Animações baseadas em spring physics, gestures e layout animations" },
  { name: "Google OAuth 2.0", version: "OAuth 2.0", icon: ShieldCheck, description: "Autenticação segura com validação de e-mail e controle de sessão" },
  { name: "Vercel Platform", version: "Edge", icon: Rocket, description: "Deploy contínuo, Edge Functions e CDN global de alta performance" },
];

const features = [
  { text: "Dashboard real-time com polling inteligente a cada 15 segundos", icon: BarChart3 },
  { text: "Autenticação Google OAuth + Geofencing por GPS (raio 50 km)", icon: Lock },
  { text: "Notificações sonoras e push ao receber novas confirmações", icon: Bell },
  { text: "Telemetria de dispositivo: GPU, RAM, bateria, resolução e rede", icon: MonitorSmartphone },
  { text: "Gestão granular de permissões por tela para cada operador", icon: Users },
  { text: "Mural Live para telões com rotação automática de mensagens", icon: MessageSquare },
  { text: "13 temas visuais dinâmicos (Dourado, BT21, BTS, Toy Story e mais)", icon: Palette },
  { text: "5 designs de painel administrativo + 5 designs de convite", icon: Layout },
  { text: "Sistema de RSVP inteligente com suporte a famílias e individuais", icon: CheckCircle2 },
  { text: "Lista de presentes com reserva automática e sugestão de fraldas", icon: Gift },
  { text: "Sistema multi-evento: criação, edição e compartilhamento por e-mail", icon: Share2 },
  { text: "Histórico completo de respostas e auditoria de sessões por dispositivo", icon: History },
  { text: "Controle de visibilidade de recados no mural público", icon: Eye },
  { text: "Tour guiado interativo passo a passo para novos operadores", icon: Map },
  { text: "PWA instalável com manifest, ícones e suporte offline parcial", icon: Smartphone },
];

const stats = [
  { label: "Server Actions", value: "44", description: "Operações server-side type-safe" },
  { label: "Componentes", value: "25+", description: "React components reutilizáveis" },
  { label: "Modelos Prisma", value: "9", description: "Event, Guest, Gift, Admin e mais" },
  { label: "Temas Visuais", value: "13", description: "Paletas dinâmicas via banco de dados" },
];

export default function AboutPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full space-y-20 pb-24 mt-12"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="space-y-6 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-px w-16 bg-primary" />
             <p className="text-xs text-primary font-medium tracking-[0.4em] uppercase">System Architecture v3.0</p>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-serif text-stone-900 tracking-tight leading-tight">
              Sobre o <br/><span className="text-primary italic">Sistema</span>
            </h1>
            <p className="mt-6 text-sm text-stone-500 tracking-[0.2em] font-light uppercase max-w-2xl leading-relaxed">
              Plataforma full-stack de gestão de eventos desenvolvida com Next.js 16 e React 19.
              Suporte a múltiplos eventos simultâneos, colaboração entre administradores,
              13 temas visuais, 5 designs de painel, 5 designs de convite e segurança por geolocalização.
            </p>
          </div>
        </motion.header>

        {/* Stats Strip */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3 }}
              className="bg-white/70 backdrop-blur-md border border-white/80 p-6 rounded-2xl shadow-sm text-center group hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <p className="text-3xl font-serif text-primary tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-700 mt-2">{stat.label}</p>
              <p className="text-[9px] text-stone-400 mt-1 font-light">{stat.description}</p>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          <div className="xl:col-span-8 space-y-16">
            {/* Visão Geral */}
            <motion.section variants={itemVariants} className="relative bg-white/70 backdrop-blur-2xl p-10 md:p-14 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
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
                    O sistema é fundamentado no conceito de <strong className="font-medium text-stone-900">Glassmorphism e Luxo Interativo</strong>.
                    A interface não possui apenas um fim funcional, mas sim o de proporcionar uma experiência visual agradável e sofisticada para organizadores e convidados.
                  </p>
                  <p>
                    Com operações de banco de dados inteiramente <strong className="font-medium text-stone-900">Real-time (Zero Cache)</strong> via
                    Server Actions do Next.js 16, a plataforma garante que todo RSVP ou alteração de configurações do evento reflitam de modo imediato em todos os dispositivos,
                    combinando <strong className="font-medium text-stone-900">PostgreSQL Serverless (Neon)</strong> e polling inteligente.
                  </p>
                  <p>
                    Suporta <strong className="font-medium text-stone-900">múltiplos eventos simultâneos</strong> com colaboração entre administradores via compartilhamento de evento por e-mail.
                    Cada evento possui convite, tema, lista de presentes e histórico de respostas completamente independentes.
                  </p>
                  <p>
                    A autenticação utiliza <strong className="font-medium text-stone-900">Google OAuth 2.0</strong> com validação de
                    geolocalização por GPS/IP, garantindo que apenas usuários autorizados dentro de um raio geográfico definido possam acessar o painel administrativo.
                    Cada sessão registra dados detalhados do dispositivo (GPU, RAM, bateria, resolução) para auditoria completa.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Tecnologias */}
            <motion.section variants={itemVariants} className="space-y-8">
              <h2 className="text-sm font-serif tracking-[0.3em] text-primary uppercase pl-2">Stack Tecnológico</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
                {techStack.map((tech) => (
                  <motion.div
                    key={tech.name}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="h-full border-white/40 bg-white/40 backdrop-blur-md rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2.5 bg-stone-100/80 rounded-xl text-stone-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
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
            {/* Funcionalidades */}
            <motion.section variants={itemVariants} className="bg-stone-900 text-stone-300 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-20 -right-20 text-white/5 group-hover:text-white/10 transition-colors duration-700">
                 <Zap className="h-64 w-64 transform -rotate-12" />
               </div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-sm font-serif tracking-[0.3em] text-white uppercase mb-2">Funcionalidades</h2>
                  <p className="text-[10px] text-stone-500 tracking-[0.2em] uppercase font-light">15 Módulos Implementados</p>
                </div>
                <ul className="space-y-5">
                  {features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex gap-4 items-start"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <feature.icon className="h-4 w-4 text-primary shrink-0 mt-0.5 opacity-80" />
                      <span className="text-xs tracking-wide leading-relaxed font-light text-stone-300">{feature.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Segurança */}
            <motion.section variants={itemVariants} className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 relative overflow-hidden group backdrop-blur-sm">
               <div className="absolute top-0 right-0 p-6 text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                 <Fingerprint className="h-24 w-24" />
               </div>
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl shadow-sm">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Segurança Multicamada</h2>
                 </div>
                 <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-light">
                   <p>
                     <strong className="font-semibold text-stone-800">Camada 1 — Autenticação:</strong> Login exclusivo via Google OAuth 2.0 com aprovação do administrador principal.
                   </p>
                   <p>
                     <strong className="font-semibold text-stone-800">Camada 2 — Geofencing:</strong> Validação por GPS nativo e fallback via IP. Acesso bloqueado fora do raio de 50 km do evento.
                   </p>
                   <p>
                     <strong className="font-semibold text-stone-800">Camada 3 — Sessões:</strong> Monitoramento a cada 5 s com revogação remota instantânea e log completo de auditoria.
                   </p>
                   <p>
                     <strong className="font-semibold text-stone-800">Camada 4 — Permissões:</strong> Controle granular de telas permitidas por operador com route guard client-side.
                   </p>
                   <p>
                     <strong className="font-semibold text-stone-800">Camada 5 — Isolamento:</strong> Todas as operações de dados são escopadas ao eventId ativo — impossível acessar dados de outro evento.
                   </p>
                 </div>
               </div>
            </motion.section>

            {/* Links */}
            <motion.section variants={itemVariants} className="p-8 rounded-[2rem] bg-white/70 backdrop-blur-md border border-white/80 shadow-sm space-y-4">
              <h2 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Links do Projeto</h2>
              <div className="space-y-3">
                <a
                  href="https://github.com/dnlortega/Cha-bebe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all group shadow-md"
                >
                  <Code2 className="h-5 w-5" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex-1">Código Fonte</span>
                  <ExternalLink className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
                <a
                  href="https://cha-bebe.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all group shadow-md"
                >
                  <Rocket className="h-5 w-5" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase flex-1">Deploy (Vercel)</span>
                  <ExternalLink className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </motion.section>
          </div>
        </div>

        <motion.footer variants={itemVariants} className="pt-16 mt-16 border-t border-stone-200 text-center relative">
           <div className="absolute left-1/2 -top-px -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
           <p className="text-[10px] tracking-[0.5em] text-stone-400 uppercase font-light">
              Design & Arquitetura Premium • Next.js 16 + React 19 • {new Date().getFullYear()}
           </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
