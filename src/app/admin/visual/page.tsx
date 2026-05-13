"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials } from "@/app/actions";
import { useTheme } from "@/components/ThemeProvider";
import { useAdminAuth } from "@/app/admin/layout";
import { THEMES } from "@/lib/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Settings as SettingsIcon, Check, UserCircle, ShieldCheck, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAdminAuth();
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    if (currentUser) setNewUsername(currentUser);
  }, [currentUser]);

  const fetchSettings = async () => {
    const data = await getSettings();
    setInvitationUrl(data.invitationUrl);
    setTheme(data.theme);
    setSessionTimeout(data.sessionTimeout || 30);
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const result = await updateSettings(invitationUrl, theme, sessionTimeout);
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error(result.error);
    }
    setSavingSettings(false);
  };

  const handleUpdateAdmin = async () => {
    if (!currentUser || !newUsername || !newPassword) {
      toast.error("PREENCHA TODOS OS CAMPOS");
      return;
    }
    setSavingAdmin(true);
    const result = await updateAdminCredentials(currentUser, newUsername, newPassword);
    if (result.success) {
      toast.success("CREDENCIAIS ATUALIZADAS! REALIZE LOGIN NOVAMENTE.");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast.error(result.error);
    }
    setSavingAdmin(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">CONFIGURAÇÕES</h1>
        <p className="text-[10px] opacity-50 tracking-[0.3em] font-light uppercase">PERSONALIZE O SISTEMA E ACESSOS</p>
      </div>

      <div className="max-w-3xl space-y-12">
        {/* Estilo Card */}
        <Card className="border-none shadow-sm bg-white rounded-none p-6 sm:p-12">
          <CardHeader className="p-0 space-y-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-serif text-primary tracking-widest flex items-center justify-center sm:justify-start gap-3">
                <SettingsIcon className="w-5 h-5" />
                VISUAL
              </CardTitle>
              <Separator className="w-12 bg-primary/20 mx-auto sm:mx-0" />
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 flex items-center justify-center rounded-none shadow-xl transition-all disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR ALTERAÇÕES</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent className="p-0 pt-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">IMAGEM DO CONVITE (URL)</label>
              <Input 
                value={invitationUrl}
                onChange={(e) => setInvitationUrl(e.target.value)}
                placeholder="/convite.png ou link externo"
                className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50 text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">PALETA DE CORES / TEMA</label>
                 <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
                   <SelectTrigger className="rounded-none border-primary/10 h-14 tracking-[0.2em] bg-stone-50 text-[11px]">
                     <SelectValue placeholder="SELECIONE O TEMA" />
                   </SelectTrigger>
                   <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                     {THEMES.map((t) => (
                       <SelectItem key={t.id} value={t.id} className="py-3">
                         {t.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-4">
                 <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">TEMPO DE SESSÃO (SEGUNDOS)</label>
                 <Input 
                   type="number"
                   value={sessionTimeout}
                   onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 1)}
                   className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50 text-[11px]"
                 />
                 <p className="text-[8px] opacity-30 tracking-widest uppercase">O PAINEL PEDIRÁ SENHA APÓS ESSE TEMPO DE INATIVIDADE.</p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Card */}
        <Card className="border-none shadow-sm bg-white rounded-none p-6 sm:p-12 border-t-4 border-primary">
          <CardHeader className="p-0 space-y-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-serif text-primary tracking-widest flex items-center justify-center sm:justify-start gap-3">
                <ShieldCheck className="w-5 h-5" />
                ACESSO
              </CardTitle>
              <Separator className="w-12 bg-primary/20 mx-auto sm:mx-0" />
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleUpdateAdmin}
                  disabled={savingAdmin}
                  className="bg-stone-900 hover:bg-stone-800 text-white h-14 w-14 flex items-center justify-center rounded-none shadow-xl transition-all disabled:opacity-50"
                >
                  {savingAdmin ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR ACESSO</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent className="p-0 pt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">NOVO USUÁRIO</label>
                 <Input 
                   value={newUsername}
                   onChange={(e) => setNewUsername(e.target.value)}
                   placeholder="USUÁRIO"
                   className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50 text-[11px]"
                 />
               </div>

               <div className="space-y-4">
                 <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">NOVA SENHA</label>
                 <Input 
                   type="password"
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="DIGITE A NOVA SENHA"
                   className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50 text-[11px]"
                 />
               </div>
            </div>
            <p className="text-[9px] opacity-40 tracking-widest uppercase bg-stone-50 p-4 border-l-2 border-primary/20">
              AO ALTERAR AS CREDENCIAIS, VOCÊ SERÁ DESLOGADO AUTOMATICAMENTE POR SEGURANÇA.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
