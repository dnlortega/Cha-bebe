"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials, getAdminSessions, revokeAdminSession } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { Save, Loader2, Settings as SettingsIcon, Image as ImageIcon, MapPin, Calendar, Lock } from "lucide-react";

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [showInvitationImage, setShowInvitationImage] = useState(true);
  const [inviteFont, setInviteFont] = useState("Playfair Display");
  const [inviteFontSize, setInviteFontSize] = useState(18);
  const [systemFont, setSystemFont] = useState("Inter");
  const [systemFontSize, setSystemFontSize] = useState(14);
  const [babyName, setBabyName] = useState("");
  const [babyGender, setBabyGender] = useState("NONE");
  const [eventDate, setEventDate] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventMapsUrl, setEventMapsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  // Estados de controle de sessões ativas
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSessions();
    if (typeof window !== "undefined") {
      setCurrentSessionToken(localStorage.getItem("admin_session_token") || "");
    }
  }, []);

  const fetchSettings = async () => {
    const data = await getSettings();
    if (data) {
      setInvitationUrl(data.invitationUrl || "");
      setTheme(data.theme || "GOLD");
      setInviteFont(data.inviteFont || "Playfair Display");
      setInviteFontSize(data.inviteFontSize || 18);
      setSystemFont(data.systemFont || "Inter");
      setSystemFontSize(data.systemFontSize || 14);
      setShowInvitationImage(data.showInvitationImage ?? true);
      setBabyName(data.babyName || "");
      setBabyGender(data.babyGender || "NONE");
      setEventDate(data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : "");
      setEventAddress(data.eventAddress || "");
      setEventMapsUrl(data.eventMapsUrl || "");
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getAdminSessions();
      setSessions(data);
    } catch (e) {
      console.error("Erro ao carregar sessões:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (id: string, token: string) => {
    const res = await revokeAdminSession(id);
    if (res.success) {
      toast.success("DISPOSITIVO DESCONECTADO");
      // Se desconectou a si mesmo, força deslogar
      if (token === currentSessionToken) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_session_token");
          localStorage.removeItem("admin_authorized");
          localStorage.removeItem("admin_username");
          window.location.reload();
        }
      } else {
        fetchSessions();
      }
    } else {
      toast.error("Erro ao desconectar dispositivo");
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const result = await updateSettings({ invitationUrl, theme, inviteFont, inviteFontSize, systemFont, systemFontSize, showInvitationImage, babyName, babyGender, eventDate, eventAddress, eventMapsUrl });
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error("ERRO AO SALVAR. Reinicie o terminal.");
    }
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
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Fonte do Convite</label><Select value={inviteFont} onValueChange={(v) => v && setInviteFont(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Playfair Display">Playfair Display</SelectItem><SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem><SelectItem value="Dancing Script">Dancing Script</SelectItem><SelectItem value="Great Vibes">Great Vibes</SelectItem><SelectItem value="Lora">Lora</SelectItem><SelectItem value="Cinzel">Cinzel</SelectItem></SelectContent></Select></div>
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tamanho da Fonte (Convite)</label><Input type="number" value={inviteFontSize} onChange={e => setInviteFontSize(Number(e.target.value))} className="rounded-none h-12 bg-stone-50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Fonte do Sistema (Painel)</label><Select value={systemFont} onValueChange={(v) => v && setSystemFont(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Inter">Inter</SelectItem><SelectItem value="Outfit">Outfit</SelectItem><SelectItem value="DM Sans">DM Sans</SelectItem><SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans</SelectItem></SelectContent></Select></div>
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tamanho da Fonte (Painel)</label><Input type="number" value={systemFontSize} onChange={e => setSystemFontSize(Number(e.target.value))} className="rounded-none h-12 bg-stone-50" /></div>
            </div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Nome do Bebê</label><Input value={babyName} onChange={e => setBabyName(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="Ex: Arthur ou Helena" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Sexo do Bebê</label><Select value={babyGender} onValueChange={(v) => v && setBabyGender(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">NÃO DEFINIDO</SelectItem><SelectItem value="BOY">MENINO (AZUL)</SelectItem><SelectItem value="GIRL">MENINA (ROSA)</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Exibir Imagem do Convite</label><Select value={showInvitationImage ? "SIM" : "NAO"} onValueChange={(v) => setShowInvitationImage(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NÃO</SelectItem></SelectContent></Select></div>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-white rounded-none p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary"><Calendar className="h-4 w-4" /><h3 className="text-xs font-bold tracking-widest uppercase">Data & Local</h3></div>
            <div className="space-y-4">
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Data do Evento</label><Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-none h-12 bg-stone-50" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Endereço Exibido</label><Input value={eventAddress} onChange={e => setEventAddress(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="Rua exemplo, 123" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Link Google Maps</label><Input value={eventMapsUrl} onChange={e => setEventMapsUrl(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="https://goo.gl/maps/..." /></div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-none shadow-2xl bg-stone-900 text-white rounded-none p-10">
          <div className="flex items-center gap-3 mb-8"><Lock className="h-4 w-4 text-primary" /><h3 className="text-xs font-bold tracking-widest uppercase">Acesso Administrativo</h3></div>
          <form onSubmit={handleUpdateAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Novo Usuário</label><Input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="rounded-none h-12 bg-white/5 border-white/10" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Nova Senha</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-none h-12 bg-white/5 border-white/10" /></div>
            <Button type="submit" disabled={updatingAdmin} className="h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/95">{updatingAdmin ? <Loader2 className="animate-spin" /> : "ATUALIZAR ACESSO"}</Button>
          </form>
        </Card>

        {/* Dispositivos Logados */}
        <Card className="border border-stone-200 shadow-xl bg-white rounded-none p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock className="h-4 w-4 animate-pulse" />
              <h3 className="text-xs font-bold tracking-widest uppercase">Dispositivos Logados</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSessions} 
              disabled={loadingSessions}
              className="text-[9px] font-bold tracking-wider rounded-none uppercase h-8 bg-stone-50 border-stone-200"
            >
              {loadingSessions ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Atualizar Lista
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-[10px] text-stone-400 text-center py-6 uppercase tracking-wider font-semibold">
                Nenhum dispositivo registrado.
              </p>
            ) : (
              <div className="divide-y divide-stone-100">
                {sessions.map((sess) => {
                  const isCurrent = sess.token === currentSessionToken;
                  const formattedDate = new Date(sess.lastActive).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div key={sess.id} className="flex items-center justify-between py-4 group">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                            {sess.deviceName}
                          </span>
                          <Badge className="bg-stone-100 text-stone-500 hover:bg-stone-100 rounded-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">
                            {sess.deviceInfo}
                          </Badge>
                          {isCurrent && (
                            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 rounded-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">
                              Este Dispositivo
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold">
                            📍 {sess.location}
                          </p>
                          <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">
                            Última atividade: {formattedDate}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(sess.id, sess.token)}
                        className="text-[9px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none uppercase h-8 px-3 tracking-widest border border-transparent hover:border-red-100"
                      >
                        {isCurrent ? "Sair" : "Desconectar"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
