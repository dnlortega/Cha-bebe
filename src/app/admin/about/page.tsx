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
  MapPin
} from "lucide-react";

const techStack = [
  { name: "Next.js", version: "15.0+", icon: Globe, description: "App Router com renderização híbrida e server actions" },
  { name: "React", version: "19.0+", icon: Code2, description: "Interface reativa e componentes concorrentes" },
  { name: "Tailwind CSS", version: "4.0+", icon: Palette, description: "Motor de estilização ultra-rápido e flexível" },
  { name: "Prisma ORM", version: "6.0+", icon: Database, description: "Gerenciamento e queries seguras ao banco de dados" },
  { name: "PostgreSQL", version: "Neon Tech", icon: Server, description: "Banco de dados serverless escalável" },
  { name: "Shadcn UI & Base UI", version: "Latest", icon: Layers, description: "Componentes headless com acessibilidade avançada" },
  { name: "Framer Motion", version: "12.0+", icon: Sparkles, description: "Motor principal de animações fluidas" },
  { name: "Google Auth", version: "OAuth 2.0", icon: ShieldCheck, description: "Autenticação segura via contas Google" },
  { name: "Geolocation API", version: "Native", icon: MapPin, description: "Bloqueio de acesso por coordenadas geográficas" },
];

const features = [
  "Dashboard Administrativo Real-time (Zero Cache)",
  "Autenticação Segura (Google OAuth + Revogação Remota)",
  "Bloqueio Geográfico Restrito à Região do Evento",
  "Captura de Detalhes do Dispositivo (Telemetria de Acesso)",
  "Gestão Avançada de Permissões por Usuário/Tela",
  "Mural Live Inteligente para Telões e TVs",
  "Tematização Dinâmica via Banco de Dados (Cores e Fontes)",
  "Sistema de RSVP Familiar e Individual Inteligente",
  "Gestão Dinâmica de Lista de Presentes e Fraldas",
  "Interface Premium Glassmorphism e Mobile-First"
];

export default function AboutPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-20 pb-24 mt-12"
      >
        <motion.header variants={itemVariants} className="space-y-6 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-px w-16 bg-primary" />
             <p className="text-xs text-primary font-medium tracking-[0.4em] uppercase">System Architecture</p>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-serif text-stone-900 tracking-tight leading-tight">
              Sobre o <br/><span className="text-primary italic">Sistema</span>
            </h1>
            <p className="mt-6 text-sm text-stone-500 tracking-[0.2em] font-light uppercase max-w-2xl leading-relaxed">
              Uma plataforma premium de gestão de eventos desenvolvida com a máxima excelência em UX/UI, 
              utilizando as tecnologias mais avançadas do ecossistema web para garantir performance extrema e segurança rigorosa.
            </p>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          <div className="xl:col-span-8 space-y-16">
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
                    Com operações de banco de dados inteiramente <strong className="font-medium text-stone-900">Real-time (Zero Cache)</strong>, 
                    a plataforma garante que todo RSVP ou alteração de configurações do evento reflitam de modo imediato em todos os dispositivos,
                    combinando PostgreSQL Serverless e Server Actions do Next.js.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="space-y-8">
              <h2 className="text-sm font-serif tracking-[0.3em] text-primary uppercase pl-2">Tecnologias de Base</h2>
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
            <motion.section variants={itemVariants} className="bg-stone-900 text-stone-300 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-20 -right-20 text-white/5 group-hover:text-white/10 transition-colors duration-700">
                 <Zap className="h-64 w-64 transform -rotate-12" />
               </div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-sm font-serif tracking-[0.3em] text-white uppercase mb-2">Funcionalidades</h2>
                  <p className="text-[10px] text-stone-500 tracking-[0.2em] uppercase font-light">Principais Implementações</p>
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

            <motion.section variants={itemVariants} className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 relative overflow-hidden group backdrop-blur-sm">
               <div className="absolute top-0 right-0 p-6 text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                 <Fingerprint className="h-24 w-24" />
               </div>
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl shadow-sm">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Segurança Extrema</h2>
                 </div>
                 <p className="text-xs text-stone-600 leading-relaxed font-light">
                    O acesso ao painel não só exige autenticação validada pelo <strong className="font-semibold text-stone-800">Google</strong> e aprovação do Master,
                    mas também telemetria e validação de geolocalização rigorosa para impedir o acesso de regiões não-autorizadas (Geofencing).
                 </p>
               </div>
            </motion.section>
          </div>
        </div>

        <motion.footer variants={itemVariants} className="pt-16 mt-16 border-t border-stone-200 text-center relative">
           <div className="absolute left-1/2 -top-px -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
           <p className="text-[10px] tracking-[0.5em] text-stone-400 uppercase font-light">
              Design & Arquitetura Premium • {new Date().getFullYear()}
           </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
