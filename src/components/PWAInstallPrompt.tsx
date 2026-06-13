"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const PWA_SEEN_KEY = "pwa_prompt_seen";

    // 1. Registrar o Service Worker da PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("PWA: SW registrado com sucesso!"))
        .catch((err) => console.log("PWA: SW falhou ao registrar:", err));
    }

    // Se já foi exibido antes, não mostrar novamente
    if (localStorage.getItem(PWA_SEEN_KEY)) return;

    // 2. Função interna para tratar o evento e mostrar o prompt de instalação
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // LER EVENTO GLOBAL (Se o evento disparou super rápido antes da hidratação do React)
    if (typeof window !== "undefined" && (window as any).deferredPrompt) {
      console.log("PWA: Evento de instalação já estava capturado no objeto window.");
      handlePrompt((window as any).deferredPrompt);
    }

    // DEFINE CALLBACK GLOBAL (Caso o evento dispare a qualquer momento depois do mount)
    if (typeof window !== "undefined") {
      (window as any).onBeforeInstallPrompt = (e: any) => {
        console.log("PWA: Evento capturado via callback global do head.");
        handlePrompt(e);
      };
    }

    // OUVINTE PADRÃO (Para navegadores que disparam o evento após a hidratação)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("PWA: Evento capturado via addEventListener padrão.");
      handlePrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Detectar iOS (Safari do iPhone/iPad não possui beforeinstallprompt, usamos tooltip de compartilhamento)
    const ua = window.navigator.userAgent;
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;

    // Verifica se já não está rodando em modo aplicativo standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (typeof window !== "undefined") {
        (window as any).onBeforeInstallPrompt = null;
      }
    };
  }, []);

  const handleInstallClick = async () => {
    // Busca o evento da React State ou do Window global como fallback
    const promptEvent = deferredPrompt || (typeof window !== "undefined" && (window as any).deferredPrompt);
    
    if (!promptEvent) {
      console.error("PWA: Nenhum evento de instalação ativo capturado!");
      return;
    }
    
    try {
      console.log("PWA: Solicitando prompt nativo de instalação...");
      // Dispara o prompt nativo de forma síncrona
      await promptEvent.prompt();
      
      // Aguarda a resposta do usuário
      const { outcome } = await promptEvent.userChoice;
      console.log(`PWA: Usuário escolheu: ${outcome}`);
      
      if (outcome === "accepted") {
        if (typeof window !== "undefined") {
          (window as any).deferredPrompt = null;
        }
        localStorage.setItem("pwa_prompt_seen", "1");
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } catch (err) {
      console.error("PWA: Falha ao invocar prompt nativo:", err);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 bg-white/95 backdrop-blur-md border border-primary/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] p-5 animate-in slide-in-from-bottom duration-500 flex flex-col gap-4 rounded-none">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-bold tracking-widest text-primary uppercase">Instalar no Aparelho</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
            {isIOS 
              ? "Instale o painel como um aplicativo no seu iPhone para acesso rápido." 
              : "Adicione o painel administrativo na sua tela inicial como um aplicativo nativo."}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => { localStorage.setItem("pwa_prompt_seen", "1"); setShowPrompt(false); }}
          className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-none shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isIOS ? (
        <div className="bg-primary/5 p-3 flex items-start gap-3 border border-primary/5 text-[9px] tracking-wider leading-relaxed text-primary uppercase">
          <Share className="h-4 w-4 shrink-0 text-primary opacity-60" />
          <span>
            Toque no botão <strong className="font-bold">Compartilhar</strong> do Safari e escolha <strong className="font-bold">"Adicionar à Tela de Início"</strong>.
          </span>
        </div>
      ) : (
        <Button 
          onClick={handleInstallClick} 
          className="w-full h-11 text-[10px] tracking-[0.3em] rounded-none flex items-center justify-center gap-2"
        >
          <Download className="h-3.5 w-3.5" />
          INSTALAR APLICATIVO
        </Button>
      )}
    </div>
  );
}
