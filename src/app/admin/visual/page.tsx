"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/app/actions";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Settings as SettingsIcon, Check } from "lucide-react";
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
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">VISUAL</h1>
        <p className="text-[10px] opacity-50 tracking-[0.3em] font-light">PERSONALIZE A APARÊNCIA DO EVENTO</p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Card className="border-none shadow-sm bg-white rounded-none p-6 sm:p-12">
          <CardHeader className="p-0 space-y-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-serif text-primary tracking-widest flex items-center justify-center sm:justify-start gap-3">
                <SettingsIcon className="w-5 h-5" />
                ESTILO
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
                 <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">TEMPO DE SESSÃO (MINUTOS)</label>
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
      </div>
    </div>
  );
}
