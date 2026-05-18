"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Registrar o Service Worker da PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registrado com sucesso para PWA!"))
        .catch((err) => console.log("SW falhou ao registrar:", err));
    }

    // 2. Escutar o evento do navegador de que o app é instalável (Chrome/Edge/Firefox etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Detectar iOS (Safari do iPhone/iPad não suporta beforeinstallprompt, então mostramos dicas)
    const ua = window.navigator.userAgent;
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    
    // Verifica se já não está rodando de forma instalada
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("Usuário instalou o aplicativo!");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
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
          onClick={() => setShowPrompt(false)} 
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
