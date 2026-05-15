"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { Save, Loader2, Settings as SettingsIcon, Image as ImageIcon, MapPin, Calendar, Lock } from "lucide-react";

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [showInvitationImage, setShowInvitationImage] = useState(true);
  const [eventDate, setEventDate] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventMapsUrl, setEventMapsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const data = await getSettings();
    if (data) {
      setInvitationUrl(data.invitationUrl || "");
      setTheme(data.theme || "GOLD");
      setShowInvitationImage(data.showInvitationImage ?? true);
      setEventDate(data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : "");
      setEventAddress(data.eventAddress || "");
      setEventMapsUrl(data.eventMapsUrl || "");
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const result = await updateSettings({ invitationUrl, theme, showInvitationImage, eventDate, eventAddress, eventMapsUrl });
    if (result.success) toast.success("CONFIGURAÇÕES SALVAS");
    setLoading(false);
  };

  const handleUpdateAdmin = async (e: any) => {
    e.preventDefault();
    setUpdatingAdmin(true);
    const result = await updateAdminCredentials("admin", newUsername, newPassword);
    if (result.success) toast.success("ACESSO ATUALIZADO");
    setUpdatingAdmin(false);
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Visual & Info</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Customização do Evento</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} className="h-14 w-14 rounded-none shadow-xl transition-all">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl bg-white rounded-none p-8 space-y-6">
          <div className="flex items-center gap-3 text-primary"><SettingsIcon className="h-4 w-4" /><h3 className="text-xs font-bold tracking-widest uppercase">Convite & Tema</h3></div>
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">URL do Convite</label><Input value={invitationUrl} onChange={e => setInvitationUrl(e.target.value)} className="rounded-none h-12 bg-stone-50" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tema Visual</label><Select value={theme} onValueChange={(v) => v && setTheme(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent>{THEMES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Exibir Imagem do Convite</label><Select value={showInvitationImage ? "SIM" : "NAO"} onValueChange={(v) => setShowInvitationImage(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NÃO</SelectItem></SelectContent></Select></div>
          </div>
        </Card>

        <Card className="border-none shadow-2xl bg-white rounded-none p-8 space-y-6">
          <div className="flex items-center gap-3 text-primary"><Calendar className="h-4 w-4" /><h3 className="text-xs font-bold tracking-widest uppercase">Data & Local</h3></div>
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Data do Evento</label><Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-none h-12 bg-stone-50" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Endereço Exibido</label><Input value={eventAddress} onChange={e => setEventAddress(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="Rua exemplo, 123" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Link Google Maps</label><Input value={eventMapsUrl} onChange={e => setEventMapsUrl(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="https://goo.gl/maps/..." /></div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl bg-stone-900 text-white rounded-none p-10">
        <div className="flex items-center gap-3 mb-8"><Lock className="h-4 w-4 text-primary" /><h3 className="text-xs font-bold tracking-widest uppercase">Segurança</h3></div>
        <form onSubmit={handleUpdateAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Novo Usuário</label><Input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="rounded-none h-12 bg-white/5 border-white/10" /></div>
          <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Nova Senha</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-none h-12 bg-white/5 border-white/10" /></div>
          <Button type="submit" disabled={updatingAdmin} className="h-12 rounded-none">{updatingAdmin ? <Loader2 className="animate-spin" /> : "ATUALIZAR ACESSO"}</Button>
        </form>
      </Card>
    </div>
  );
}
