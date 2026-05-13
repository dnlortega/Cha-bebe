"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { verifyAdmin } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Settings } from "lucide-react";

const AdminAuthContext = createContext<{
  authorized: boolean;
  setAuthorized: (val: boolean) => void;
}>({
  authorized: false,
  setAuthorized: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_auth") === "true";
    if (isAuth) {
      setAuthorized(true);
    }
    
    // Fetch timeout setting
    getSettings().then(settings => {
      if (settings && settings.sessionTimeout) {
        setTimeoutMinutes(settings.sessionTimeout);
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
      }, timeoutMinutes * 60 * 1000);
    };

    const handleLogout = () => {
      sessionStorage.removeItem("admin_auth");
      setAuthorized(false);
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
  }, [authorized, timeoutMinutes]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = await verifyAdmin(username, password);
    if (isCorrect) {
      setAuthorized(true);
      sessionStorage.setItem("admin_auth", "true");
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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm border border-primary/5 shadow-2xl bg-white rounded-none animate-in fade-in zoom-in duration-700">
          <CardHeader className="space-y-4 text-center pt-10">
            <div className="w-12 h-12 bg-primary/5 mx-auto flex items-center justify-center mb-2">
               <Settings className="h-6 w-6 text-primary/40" />
            </div>
            <CardTitle className="text-xl font-serif tracking-[0.3em] text-primary">ADMINISTRAÇÃO</CardTitle>
            <p className="text-[9px] opacity-40 tracking-[0.2em] uppercase">ACESSO RESTRITO</p>
            <Separator className="w-8 mx-auto bg-primary/20" />
          </CardHeader>
          <CardContent className="pb-12 px-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-30 tracking-widest uppercase">Usuário</label>
                <Input 
                  type="text" 
                  placeholder="DIGITE SEU USUÁRIO" 
                  className="bg-stone-50 border-primary/10 rounded-none focus-visible:ring-primary/20 text-[10px] tracking-widest h-12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-30 tracking-widest uppercase">Senha</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-stone-50 border-primary/10 rounded-none focus-visible:ring-primary/20 text-[10px] tracking-widest h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-[10px] tracking-[0.3em] rounded-none transition-all shadow-lg shadow-primary/10">
                  ENTRAR NO SISTEMA
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ authorized, setAuthorized }}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:pl-64 min-h-screen transition-all duration-300">
          <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto pt-20 lg:pt-12">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthContext.Provider>
  );
}
