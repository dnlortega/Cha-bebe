"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { getSettings, registerAdminSession, verifyAdminSession, updateGoogleSessionDetails } from "@/app/actions";
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

  const getGPUInfo = () => {
    if (typeof window === "undefined") return "";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as any;
      if (!gl) return "";
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        let gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
        if (gpu.includes("Direct3D")) {
          const parts = gpu.split("Direct3D");
          if (parts[0]) {
            gpu = parts[0].replace("ANGLE (", "").replace(", ", "").trim();
          }
        }
        return gpu;
      }
    } catch (e) {}
    return "";
  };

  const getConnectionType = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return "";
    try {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        const type = conn.effectiveType || conn.type || "wifi";
        const rtt = conn.rtt ? `${conn.rtt}ms` : "";
        return `Conexão: ${type.toUpperCase()}${rtt ? ` (Ping: ${rtt})` : ""}`;
      }
    } catch (e) {}
    return "";
  };

  const getDetailedDeviceName = async () => {
    if (typeof window === "undefined" || !navigator) return "Dispositivo Desconhecido";
    
    // Tenta obter o modelo ultra exato via Client Hints se suportado (Chrome/Edge)
    if ((navigator as any).userAgentData) {
      try {
        const hints = await (navigator as any).userAgentData.getHighEntropyValues(["model", "platform"]);
        if (hints.model) {
          const plat = hints.platform || "Aparelho";
          return `${plat} (${hints.model})`;
        }
      } catch (e) {}
    }

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

  const getDiagnosticsReport = async (): Promise<string> => {
    if (typeof window === "undefined") return "{}";
    
    const diag: Record<string, any> = {
      "Resolução de Tela": `${window.screen.width}x${window.screen.height}`,
      "Resolução Útil": `${window.screen.availWidth}x${window.screen.availHeight}`,
      "Densidade de Pixels": `${window.devicePixelRatio}x`,
      "Cores da Tela": `${window.screen.colorDepth} bits`,
      "Núcleos de Processamento (CPU)": `${navigator.hardwareConcurrency || "Desconhecido"} threads`,
      "Memória RAM (Aproximada)": (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "Desconhecido",
      "Idioma do Sistema": navigator.language || "Desconhecido",
      "Plataforma do Motor": navigator.platform || "Desconhecido",
      "Fuso Horário": Intl.DateTimeFormat().resolvedOptions().timeZone || "Desconhecido",
      "Navegador Online": navigator.onLine ? "Sim" : "Não",
      "Cookies Habilitados": navigator.cookieEnabled ? "Sim" : "Não",
      "Local Storage Habilitado": typeof localStorage !== "undefined" ? "Sim" : "Não"
    };

    if ((navigator as any).getBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        diag["Nível da Bateria"] = `${Math.round(battery.level * 100)}%`;
        diag["Carregando Bateria"] = battery.charging ? "Sim" : "Não";
      } catch (e) {}
    }

    return JSON.stringify(diag);
  };

  const isWithinBauruGPS = (gpsCoords: string): boolean => {
    try {
      const [lat, lon] = gpsCoords.split(",").map(Number);
      if (isNaN(lat) || isNaN(lon)) return false;
      const bauruLat = -22.3147;
      const bauruLon = -49.0606;
      
      const R = 6371; // Raio da terra em km
      const dLat = (lat - bauruLat) * Math.PI / 180;
      const dLon = (lon - bauruLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(bauruLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= 50; // Permite num raio de até 50km
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const googleToken = urlParams.get("google_token");
          const googleUsername = urlParams.get("google_username");
          const googleError = urlParams.get("google_error");

          if (googleError) {
            toast.error(decodeURIComponent(googleError));
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          if (googleToken && googleUsername) {
            setChecking(true);
            
            // Execute exactly the same diagnostics/geofencing check as local login!
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

            let gps = await getGPSCoordinates();
            if (!gps && fallbackGps) {
              gps = fallbackGps;
            }

            // Bloqueio geográfico: o admin deve estar em Bauru, SP
            const isFromBauru = loc.toLowerCase().includes("bauru") || (gps && isWithinBauruGPS(gps));
            if (!isFromBauru) {
              toast.error("ACESSO BLOQUEADO: O painel só pode ser acessado em Bauru, SP.");
              setChecking(false);
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }

            // Obtem informacoes de dispositivo enriquecidas
            const browser = getDeviceInfo();
            const net = getConnectionType();
            const devInfo = net ? `${browser} | ${net}` : browser;

            const baseName = await getDetailedDeviceName();
            const gpu = getGPUInfo();
            const devName = gpu ? `${baseName} | GPU: ${gpu}` : baseName;
            const diagnostics = await getDiagnosticsReport();

            // Enriquece a sessão criada no callback
            await updateGoogleSessionDetails(googleToken, devInfo, devName, loc, gps, diagnostics);

            // Salva as credenciais no localStorage
            localStorage.setItem("admin_session_token", googleToken);
            localStorage.setItem("admin_authorized", "true");
            localStorage.setItem("admin_username", googleUsername);

            setAuthorized(true);
            setCurrentUser(googleUsername);
            toast.success("CONECTADO COM SUCESSO VIA GOOGLE!");

            // Limpa os parâmetros da URL para evitar expor o token
            window.history.replaceState({}, document.title, window.location.pathname);
            setChecking(false);
            return;
          }

          // --- Normal Session Validation ---
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
      } catch (error) {
        console.warn("Erro temporário de conexão com o servidor durante a inicialização:", error);
      } finally {
        setChecking(false);
      }
    };

    initAuth().catch(err => {
      console.warn("Rejeição tratada em initAuth:", err);
    });
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
          <CardContent className="pb-20 px-12 pt-6">
            <div className="space-y-6">
              <Button
                type="button"
                onClick={() => {
                  setChecking(true);
                  window.location.href = "/api/auth/google";
                }}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white h-14 text-[10px] tracking-[0.4em] rounded-none transition-all shadow-2xl hover:translate-y-[-2px] flex items-center justify-center gap-3 font-semibold uppercase"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.284 2.68 1.258 6.586l3.923 3.149z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.536 12.218c0-.791-.073-1.582-.218-2.345H12v4.455h6.473a5.53 5.53 0 0 1-2.4 3.636v3.018h3.873c2.264-2.09 3.59-5.173 3.59-8.764z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235l-3.923 3.15A11.954 11.954 0 0 0 12 24c3.082 0 5.673-.973 7.573-2.655l-3.873-3.018c-1.073.718-2.436 1.154-3.7 1.154-2.855 0-5.264-1.927-6.136-4.527v-3.719z"
                  />
                  <path
                    fill="#34A853"
                    d="M5.266 9.765c-.218.655-.345 1.355-.345 2.1 0 .745.127 1.445.345 2.1l-3.923 3.15A11.942 11.942 0 0 1 0 12c0-1.89.445-3.673 1.236-5.273l4.03 3.038z"
                  />
                </svg>
                ENTRAR COM GOOGLE
              </Button>
            </div>
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
