"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { verifyAdmin, getSettings, registerAdminSession, verifyAdminSession } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Settings as SettingsIcon, UserCircle } from "lucide-react";
import Image from "next/image";

const AdminAuthContext = createContext<{
  authorized: boolean;
  setAuthorized: (val: boolean) => void;
  currentUser: string | null;
}>({
  authorized: false,
  setAuthorized: () => {},
  currentUser: null,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);

  const getDeviceInfo = () => {
    if (typeof window === "undefined" || !navigator) return "Navegador Desconhecido";
    const ua = navigator.userAgent;
    let browser = "Web Browser";
    if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Edg/i.test(ua)) browser = "Edge";
    return browser;
  };

  const getDetailedDeviceName = () => {
    if (typeof window === "undefined" || !navigator) return "Dispositivo Desconhecido";
    const ua = navigator.userAgent;
    
    if (/iPhone/i.test(ua)) {
      return "Apple iPhone";
    }
    if (/iPad/i.test(ua)) {
      return "Apple iPad";
    }
    if (/Macintosh/i.test(ua)) {
      return "Macbook / Apple Mac";
    }
    if (/Windows/i.test(ua)) {
      let osVersion = "Windows PC";
      if (/Windows NT 10.0/i.test(ua)) osVersion = "Windows 10/11 PC";
      else if (/Windows NT 6.3/i.test(ua)) osVersion = "Windows 8.1 PC";
      else if (/Windows NT 6.2/i.test(ua)) osVersion = "Windows 8 PC";
      else if (/Windows NT 6.1/i.test(ua)) osVersion = "Windows 7 PC";
      return osVersion;
    }
    if (/Android/i.test(ua)) {
      const matches = ua.match(/\(([^)]+)\)/);
      if (matches && matches[1]) {
        const parts = matches[1].split(";");
        const modelPart = parts.find(p => p.includes("Build/") || (!p.includes("Linux") && !p.includes("Android") && p.trim().length > 3));
        if (modelPart) {
          return `Celular Android (${modelPart.replace("Build/", "").trim()})`;
        }
      }
      return "Celular Android";
    }
    if (/Linux/i.test(ua)) {
      return "Linux Desktop";
    }
    return "Dispositivo Desconhecido";
  };

  const getGPSCoordinates = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.warn("Permissão de GPS física negada:", error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const getLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.city && data.region_code) {
          return `${data.city}, ${data.region_code} - ${data.country_name || "Brasil"}`;
        }
      }
    } catch (e) {
      console.error("Erro ao obter localizacao:", e);
    }
    return "Localização Desconhecida";
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin_session_token");
        const savedUser = localStorage.getItem("admin_username");
        if (token) {
          // Verifica se o token de sessao ainda é valido no banco de dados
          const isValid = await verifyAdminSession(token);
          if (isValid && savedUser) {
            setAuthorized(true);
            setCurrentUser(savedUser);
          } else {
            // Sessao foi revogada! Desloga imediatamente
            localStorage.removeItem("admin_session_token");
            localStorage.removeItem("admin_authorized");
            localStorage.removeItem("admin_username");
            setAuthorized(false);
            setCurrentUser(null);
          }
        } else {
          // Sem token ativo no banco! Desloga imediatamente
          localStorage.removeItem("admin_session_token");
          localStorage.removeItem("admin_authorized");
          localStorage.removeItem("admin_username");
          setAuthorized(false);
          setCurrentUser(null);
        }
      }
      
      const settings = await getSettings();
      if (settings && settings.sessionTimeout) {
        setTimeoutSeconds(settings.sessionTimeout);
      }
      setChecking(false);
    };

    initAuth();
  }, []);

  // Idle Timer Logic (DESATIVADO por solicitação do usuário)
  useEffect(() => {
    // Timer de inatividade inativo
    return;
  }, [authorized, timeoutSeconds]);

  // Monitoramento active e instantâneo da revogação de sessão (Derrubar dispositivo automaticamente)
  useEffect(() => {
    if (!authorized) return;

    const sessionChecker = setInterval(async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin_session_token");
        if (token) {
          const isValid = await verifyAdminSession(token);
          if (!isValid) {
            // Sessão foi deletada/revogada no banco! Desconecta imediatamente
            localStorage.removeItem("admin_session_token");
            localStorage.removeItem("admin_authorized");
            localStorage.removeItem("admin_username");
            setAuthorized(false);
            setCurrentUser(null);
            toast.error("SUA SESSÃO FOI ENCERRADA REMOTAMENTE");
          }
        }
      }
    }, 5000); // Roda a cada 5 segundos de forma ultra leve

    return () => clearInterval(sessionChecker);
  }, [authorized]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = await verifyAdmin(username, password);
    if (isCorrect) {
      // 1. Gera um novo token de sessao unico
      const token = "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // 2. Obtem as informacoes de localizacao via IP e fallback de GPS
      let loc = "Localização Desconhecida";
      let fallbackGps = "";
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.region_code) {
            loc = `${data.city}, ${data.region_code} - ${data.country_name || "Brasil"}`;
          }
          if (data.latitude && data.longitude) {
            fallbackGps = `${data.latitude},${data.longitude}`;
          }
        }
      } catch (err) {
        console.error("Erro no fetch de localizacao por IP:", err);
      }

      // 3. Tenta obter o GPS real do navegador
      let gps = await getGPSCoordinates();
      if (!gps && fallbackGps) {
        gps = fallbackGps; // Usa o do IP se falhar
      }
      
      // 4. Obtem informacoes de dispositivo
      const devInfo = getDeviceInfo();
      const devName = getDetailedDeviceName();
      
      // 5. Registra a sessao no banco de dados com GPS
      await registerAdminSession(token, devInfo, devName, loc, gps);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session_token", token);
        localStorage.setItem("admin_authorized", "true");
        localStorage.setItem("admin_username", username);
      }
      
      setAuthorized(true);
      setCurrentUser(username);
    } else {
      toast.error("USUÁRIO OU SENHA INCORRETOS");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 font-sans">
        <Card className="w-full max-w-sm border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white rounded-none animate-in fade-in zoom-in duration-1000 overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <CardHeader className="space-y-6 text-center pt-16 pb-10">
            <div className="w-20 h-20 bg-stone-900 mx-auto flex items-center justify-center rotate-45 group hover:rotate-0 transition-all duration-700 shadow-2xl relative overflow-hidden">
               <div className="-rotate-45 group-hover:rotate-0 transition-all duration-700 w-full h-full p-2">
                  <Image 
                    src="/icon.png" 
                    alt="Logo" 
                    fill 
                    className="object-cover"
                  />
               </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-serif tracking-[0.2em] text-primary uppercase">Welcome</CardTitle>
              <p className="text-[9px] opacity-30 tracking-[0.5em] uppercase font-light">Acesso Administrativo</p>
            </div>
          </CardHeader>
          <CardContent className="pb-20 px-12">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <div className="relative group">
                  <Input 
                    type="text" 
                    placeholder="USERNAME" 
                    className="bg-transparent border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-primary text-[11px] tracking-[0.3em] h-12 text-center transition-all placeholder:opacity-20 uppercase font-bold"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>

                <div className="relative group">
                  <Input 
                    type="password" 
                    placeholder="PASSWORD" 
                    className="bg-transparent border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-primary text-[11px] tracking-[0.3em] h-12 text-center transition-all placeholder:opacity-20 uppercase font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-stone-900 hover:bg-stone-800 text-white h-14 text-[10px] tracking-[0.4em] rounded-none transition-all shadow-2xl hover:translate-y-[-2px]"
              >
                LOGIN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ authorized, setAuthorized, currentUser }}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:pl-20 min-h-screen transition-all duration-300">
          <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto pt-20 lg:pt-12">
            {children}
          </div>
        </main>
        <PWAInstallPrompt />
      </div>
    </AdminAuthContext.Provider>
  );
}
