"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials, distributeDiapers } from "@/app/actions";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { THEMES } from "@/lib/themes";
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
  Info,
  PackageCheck
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loading, setLoading] = useState(false);
  
  // Diaper states
  const [rnQty, setRnQty] = useState(0);
  const [pQty, setPQty] = useState(0);
  const [mQty, setMQty] = useState(0);
  const [gQty, setGQty] = useState(0);
  const [ggQty, setGgQty] = useState(0);
  const [distributing, setDistributing] = useState(false);

  // Admin credentials state
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
      setRnQty(data.rnQty || 0);
      setPQty(data.pQty || 0);
      setMQty(data.mQty || 0);
      setGQty(data.gQty || 0);
      setGgQty(data.ggQty || 0);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const result = await updateSettings(
      invitationUrl, 
      theme, 
      sessionTimeout,
      rnQty,
      pQty,
      mQty,
      gQty,
      ggQty
    );
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDistribute = async () => {
    setDistributing(true);
    const result = await distributeDiapers();
    if (result.success) {
      toast.success("FRALDAS DISTRIBUÍDAS COM SUCESSO!");
    } else {
      toast.error(result.error);
    }
    setDistributing(false);
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-none shadow-xl transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR TUDO</TooltipContent>
        </Tooltip>
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
                    <Select value={theme} onValueChange={(val) => setTheme(val || "GOLD")}>
                      <SelectTrigger className="rounded-none border-primary/10 h-14 bg-stone-50 text-[11px] tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-[10px]">
                        {THEMES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
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

        {/* Diapers Management */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <PackageCheck className="h-5 w-5 text-primary opacity-30" />
              <h3 className="text-xs font-serif tracking-[0.3em] uppercase">Gestão de Fraldas</h3>
           </div>

           <Card className="border-none shadow-2xl bg-white rounded-none p-10 space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                 {[
                   { id: 'rn', label: 'RN', val: rnQty, set: setRnQty },
                   { id: 'p', label: 'P', val: pQty, set: setPQty },
                   { id: 'm', label: 'M', val: mQty, set: setMQty },
                   { id: 'g', label: 'G', val: gQty, set: setGQty },
                   { id: 'gg', label: 'GG', val: ggQty, set: setGgQty },
                 ].map((size) => (
                   <div key={size.id} className="space-y-2">
                      <label className="text-[9px] font-bold opacity-30 tracking-widest uppercase text-center block">{size.label}</label>
                      <Input 
                        type="number"
                        value={size.val}
                        onChange={(e) => size.set(parseInt(e.target.value) || 0)}
                        className="rounded-none border-primary/10 bg-stone-50 h-12 text-center text-[11px] tracking-widest"
                      />
                   </div>
                 ))}
              </div>

              <div className="space-y-6">
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button 
                       onClick={handleDistribute} 
                       disabled={distributing}
                       variant="outline"
                       size="icon"
                       className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white rounded-none h-14 transition-all"
                     >
                       {distributing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent className="text-[10px] tracking-widest uppercase">DISTRIBUIR FRALDAS AUTOMATICAMENTE</TooltipContent>
                 </Tooltip>
                 
                 <p className="text-[8px] opacity-30 text-center uppercase tracking-widest">
                    O sistema prioriza os tamanhos na ordem: RN → P → M → G → GG
                 </p>
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

                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button 
                       type="submit" 
                       disabled={updatingAdmin}
                       variant="outline"
                       size="icon"
                       className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white rounded-none h-14 transition-all"
                     >
                       {updatingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR CREDENCIAIS</TooltipContent>
                 </Tooltip>
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
