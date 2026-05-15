"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const techStack = [
    { name: "Next.js", version: "16.2.6", icon: Globe, description: "Framework React para produção com App Router" },
    { name: "React", version: "19.2.4", icon: Code2, description: "Biblioteca principal para interface do usuário" },
    { name: "Tailwind CSS", version: "4.0", icon: Palette, description: "Estilização utilitária de alta performance" },
    { name: "Prisma ORM", version: "6.4.1", icon: Database, description: "Modelagem e acesso ao banco de dados" },
    { name: "PostgreSQL", version: "Neon Tech", icon: Layers, description: "Banco de dados relacional serverless" },
    { name: "Lucide React", version: "1.14.0", icon: Zap, description: "Conjunto de ícones premium e consistentes" },
    { name: "Framer Motion", version: "12.38.0", icon: Zap, description: "Biblioteca de animações fluidas" },
    { name: "Shadcn UI", version: "Latest", icon: Layers, description: "Componentes de interface acessíveis e elegantes" },
  ];

  const features = [
    "Mural Live Inteligente para Telão e TVs",
    "Gestão Dinâmica de Lista de Presentes (Reserva Única)",
    "Gerador de Convite Direto pelo WhatsApp",
    "Tematização Dinâmica por Sexo e Nome do Bebê",
    "Exibição de Data, Local e Link do Maps",
    "Sistema de RSVP Individual e Familiar",
    "Distribuição Automática de Tamanhos de Fralda e Kit Churrasco",
    "Performance Real-time Otimizada (Zero Cache)",
    "Interface Mobile-First de Alto Luxo"
  ];

  return (
    <div className="max-w-6xl space-y-16 animate-in fade-in duration-1000 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
           <div className="h-1 w-12 bg-primary" />
           <p className="text-[10px] opacity-40 tracking-[0.6em] font-light uppercase">System Architecture</p>
        </div>
        <h1 className="text-5xl font-serif text-primary tracking-[0.2em]">SOBRE O SISTEMA</h1>
        <p className="text-[11px] opacity-60 tracking-[0.3em] font-light uppercase max-w-2xl leading-loose">
          UMA PLATAFORMA DE GESTÃO DE EVENTOS DE ALTO PADRÃO, DESENVOLVIDA COM AS TECNOLOGIAS MAIS RECENTES DO ECOSSISTEMA WEB.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Core Description */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8 bg-white p-12 border border-primary/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Cpu className="h-32 w-32" />
            </div>
            <h2 className="text-xl font-serif tracking-[0.3em] text-primary uppercase flex items-center gap-4">
              <Info className="h-5 w-5" />
              VISÃO GERAL
            </h2>
            <Separator className="bg-primary/10" />
            <div className="space-y-6 text-[12px] tracking-widest leading-relaxed text-stone-600 uppercase">
              <p>
                ESTE SISTEMA FOI CONCEBIDO PARA PROPORCIONAR UMA EXPERIÊNCIA DE LUXO TANTO PARA OS ORGANIZADORES QUANTO PARA OS CONVIDADOS. 
                A ARQUITETURA AGORA É 100% REAL-TIME (ZERO CACHE), GARANTINDO QUE QUALQUER CONFIRMAÇÃO OU MENSAGEM NO MURAL APAREÇA INSTANTANEAMENTE.
              </p>
              <p>
                A GESTÃO DE DADOS UTILIZA O PRISMA COMO ORM, CONECTADO A UM BANCO DE DADOS POSTGRESQL HOSPEDADO NA NEON TECH. 
                TUDO FOI PROJETADO PARA OFERECER ESCALABILIDADE, PERFORMANCE EXCEPCIONAL E UM VISUAL IMPECÁVEL, PERFEITO PARA UM EVENTO INESQUECÍVEL.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-sm font-serif tracking-[0.3em] text-primary uppercase">TECNOLOGIAS UTILIZADAS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techStack.map((tech) => (
                <Card key={tech.name} className="border-none bg-stone-50/50 rounded-none hover:bg-white hover:shadow-xl transition-all duration-500 group">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white shadow-sm border border-primary/5 group-hover:border-primary/20 transition-colors">
                        <tech.icon className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100" />
                      </div>
                      <Badge variant="outline" className="rounded-none text-[8px] border-primary/20 font-bold">{tech.version}</Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[11px] font-bold tracking-widest uppercase">{tech.name}</h3>
                      <p className="text-[9px] opacity-40 tracking-widest leading-relaxed uppercase">{tech.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Features & Stats */}
        <div className="space-y-12">
          <section className="bg-stone-900 text-white p-12 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-10">
               <Zap className="h-40 w-40" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-serif tracking-[0.3em] uppercase">FUNCIONALIDADES</h2>
              <p className="text-[8px] opacity-40 tracking-[0.4em] uppercase font-light">KEY FEATURES IMPLEMENTED</p>
            </div>
            <Separator className="bg-white/10" />
            <ul className="space-y-6">
              {features.map((feature, i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] tracking-widest uppercase leading-relaxed font-light opacity-80 group-hover:opacity-100">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-10 border border-primary/10 space-y-6">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary opacity-40" />
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase">SEGURANÇA & SESSÃO</h2>
             </div>
             <p className="text-[9px] tracking-widest leading-relaxed opacity-60 uppercase">
                O SISTEMA IMPLEMENTA UM MECANISMO DE PROTEÇÃO DE SESSÃO COM LOGOUT AUTOMÁTICO POR INATIVIDADE, 
                CONFIGURÁVEL NO PAINEL VISUAL. AS CREDENCIAIS SÃO ARMAZENADAS COM SEGURANÇA E TODAS AS REQUISIÇÕES 
                DE MODIFICAÇÃO PASSAM POR VERIFICAÇÃO DE AUTENTICAÇÃO.
             </p>
          </section>
        </div>
      </div>

      <footer className="pt-20 border-t border-primary/5 text-center">
         <p className="text-[9px] tracking-[0.5em] opacity-30 uppercase">
            DESENVOLVIDO COM PRECISÃO • {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
}
