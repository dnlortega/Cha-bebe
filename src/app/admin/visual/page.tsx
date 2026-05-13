"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Save, 
  Loader2, 
  Settings, 
  Lock, 
  ShieldCheck, 
  Clock, 
  Palette, 
  Image as ImageIcon,
  UserCircle,
  Key,
  Info
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loading, setLoading] = useState(false);
  
  const [currentUsername, setCurrentUsername] = useState("admin");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await getSettings();
    if (data) {
      setInvitationUrl(data.invitationUrl || "");
      setTheme(data.theme || "GOLD");
      setSessionTimeout(data.sessionTimeout || 30);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const result = await updateSettings(invitationUrl, theme, sessionTimeout);
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error("PREENCHA TODOS OS CAMPOS");
      return;
    }
    setUpdatingAdmin(true);
    const result = await updateAdminCredentials(currentUsername, newUsername, newPassword);
    if (result.success) {
      toast.success("ACESSO ATUALIZADO");
      setCurrentUsername(newUsername);
      setNewUsername("");
      setNewPassword("");
    } else {
      toast.error(result.error);
    }
    setUpdatingAdmin(false);
  };

  return (
    <div className="max-w-6xl space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Settings</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Configurações do Sistema</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 text-[10px] tracking-[0.4em] rounded-none shadow-xl transition-all"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Save className="h-4 w-4 mr-3" />}
          SALVAR TUDO
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Visual & Session */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <Settings className="h-5 w-5 text-primary opacity-30" />
              <h3 className="text-xs font-serif tracking-[0.3em] uppercase">Interface & Sessão</h3>
           </div>
           
           <Card className="border-none shadow-2xl bg-white rounded-none p-10 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold opacity-30 tracking-widest uppercase flex items-center gap-3">
                   <ImageIcon className="h-3 w-3" /> Imagem do Convite
                </label>
                <Input 
                  value={invitationUrl}
                  onChange={(e) => setInvitationUrl(e.target.value)}
                  placeholder="URL da imagem"
                  className="rounded-none border-primary/10 focus-visible:ring-primary/20 bg-stone-50 h-14 text-[11px] tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-30 tracking-widest uppercase flex items-center gap-3">
                       <Palette className="h-3 w-3" /> Tema
                    </label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="rounded-none border-primary/10 h-14 bg-stone-50 text-[11px] tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-[10px]">
                        <SelectItem value="GOLD">LUXURY GOLD</SelectItem>
                        <SelectItem value="ROSE">SOFT ROSE</SelectItem>
                        <SelectItem value="BLUE">BABY BLUE</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-30 tracking-widest uppercase flex items-center gap-3">
                       <Clock className="h-3 w-3" /> Timeout (S)
                    </label>
                    <Input 
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)}
                      className="rounded-none border-primary/10 bg-stone-50 h-14 text-[11px] tracking-widest"
                    />
                 </div>
              </div>
           </Card>
        </section>

        {/* Security / Admin */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-primary opacity-30" />
              <h3 className="text-xs font-serif tracking-[0.3em] uppercase">Segurança</h3>
           </div>

           <Card className="border-none shadow-2xl bg-stone-900 text-white rounded-none p-10">
              <form onSubmit={handleUpdateAdmin} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-30 tracking-widest uppercase flex items-center gap-3">
                       <UserCircle className="h-3 w-3" /> Usuário
                    </label>
                    <Input 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="rounded-none border-white/10 bg-white/5 h-14 text-[11px] tracking-widest text-white focus-visible:ring-primary/40"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-30 tracking-widest uppercase flex items-center gap-3">
                       <Key className="h-3 w-3" /> Senha
                    </label>
                    <Input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-none border-white/10 bg-white/5 h-14 text-[11px] tracking-widest text-white focus-visible:ring-primary/40"
                    />
                 </div>

                 <Button 
                   type="submit" 
                   disabled={updatingAdmin}
                   variant="outline"
                   className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white rounded-none h-14 text-[10px] tracking-[0.4em] transition-all"
                 >
                   {updatingAdmin ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Lock className="h-4 w-4 mr-3" />}
                   ATUALIZAR
                 </Button>
              </form>
           </Card>
        </section>
      </div>

      <div className="p-8 bg-stone-50 border border-primary/5 flex items-start gap-4">
         <Info className="h-4 w-4 text-primary opacity-40 mt-1" />
         <p className="text-[9px] opacity-40 leading-relaxed uppercase tracking-widest">
            Defina o tempo de inatividade (em segundos) e as credenciais de acesso ao banco de dados.
         </p>
      </div>
    </div>
  );
}
