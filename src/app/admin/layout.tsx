"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { verifyAdmin, getSettings } from "@/app/actions";
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

  useEffect(() => {
    // Removed session persistence to force login on refresh
    
    // Fetch timeout setting
    getSettings().then(settings => {
      if (settings && settings.sessionTimeout) {
        setTimeoutSeconds(settings.sessionTimeout);
      }
    });

    setChecking(false);
  }, []);

  // Idle Timer Logic
  useEffect(() => {
    if (!authorized) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, timeoutSeconds * 1000);
    };

    const handleLogout = () => {
      setAuthorized(false);
      setCurrentUser(null);
      toast.info("SESSÃO ENCERRADA POR INATIVIDADE");
    };

    // Events to track activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // Initialize timer

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [authorized, timeoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = await verifyAdmin(username, password);
    if (isCorrect) {
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
