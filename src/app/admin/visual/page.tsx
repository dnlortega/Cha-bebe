"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials, getAdminSessions, revokeAdminSession, getSessionHistoryLogs, getAdminCredentials } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { THEMES, PANEL_DESIGNS, type PanelDesignId } from "@/lib/themes";
import { Save, Loader2, Settings as SettingsIcon, Calendar, Lock, Layers, CheckCircle2 } from "lucide-react";

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
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  // Panel design
  const [panelDesign, setPanelDesign] = useState<PanelDesignId>("classic");

  // Estados de controle de sessões ativas e histórico
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState<any | null>(null);

  // Histórico de auditoria de sessões
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sessionTab, setSessionTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  useEffect(() => {
    fetchSettings();
    fetchSessions();
    fetchHistory();
    fetchCredentials();
    if (typeof window !== "undefined") {
      setCurrentSessionToken(localStorage.getItem("admin_session_token") || "");
      const savedDesign = localStorage.getItem("admin_panel_design") as PanelDesignId || "classic";
      setPanelDesign(savedDesign);
    }
  }, []);

  const handlePanelDesignChange = (designId: PanelDesignId) => {
    setPanelDesign(designId);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_panel_design", designId);
      // Notify AdminSidebar to update immediately
      window.dispatchEvent(new Event("admin-design-changed"));
      toast.success(designId === "premium" ? "✨ Design Premium ativado!" : "◻ Design Clássico ativado!");
    }
  };

  const fetchCredentials = async () => {
    const data = await getAdminCredentials();
    if (data) {
      setNewUsername(data.username || "");
      setGoogleEmail(data.googleEmail || "");
    }
  };

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
      setEnableAnimations(data.enableAnimations ?? true);
      setWhatsappTemplate(data.whatsappTemplate || "");
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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getSessionHistoryLogs();
      setHistoryLogs(data);
    } catch (e) {
      console.error("Erro ao carregar histórico de sessões:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRevokeSession = async (id: string, token: string) => {
    const res = await revokeAdminSession(id);
    if (res.success) {
      toast.success("DISPOSITIVO DESCONECTADO");
      fetchHistory();
      // Se desconectou a si mesmo, força deslogar
      if (token === currentSessionToken) {
        if (typeof window !== "undefined") {
          const { clearActiveEventCookie } = await import("@/app/eventCookieActions");
          await clearActiveEventCookie();
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
    const result = await updateSettings({ invitationUrl, theme, inviteFont, inviteFontSize, systemFont, systemFontSize, showInvitationImage, babyName, babyGender, eventDate, eventAddress, eventMapsUrl, enableAnimations, whatsappTemplate });
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
    
    let currentUsername = "admin";
    if (typeof window !== "undefined") {
      currentUsername = localStorage.getItem("admin_username") || "admin";
    }

    const result = await updateAdminCredentials(currentUsername, newUsername, newPassword, googleEmail);
    if (result.success) {
      toast.success("ACESSO ATUALIZADO COM SUCESSO!");
      if (typeof window !== "undefined" && newUsername) {
        localStorage.setItem("admin_username", newUsername);
      }
      setNewPassword(""); // Limpa o campo de senha após salvar
      fetchCredentials(); // Recarrega os dados do banco
    } else {
      toast.error(result.error || "Erro ao atualizar credenciais.");
    }
    setUpdatingAdmin(false);
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Visual & Info</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Customização do Evento</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} className="h-14 w-14 rounded-none shadow-xl transition-all">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        </Button>
      </header>

      {/* ========== PANEL DESIGN SELECTOR ========== */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-stone-800">Design do Painel</h2>
            <p className="text-[9px] text-stone-400 tracking-widest uppercase font-medium mt-0.5">Escolha o layout da interface administrativa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PANEL_DESIGNS.map((design) => {
            const isSelected = panelDesign === design.id;
            return (
              <button
                key={design.id}
                onClick={() => handlePanelDesignChange(design.id as PanelDesignId)}
                className={`relative text-left rounded-2xl overflow-hidden transition-all duration-300 group ${
                  isSelected
                    ? "ring-2 ring-primary shadow-xl shadow-primary/10"
                    : "ring-1 ring-stone-200 hover:ring-primary/40 hover:shadow-lg"
                }`}
              >
                {/* Preview */}
                {design.id === "classic" ? (
                  <div className="h-32 bg-gradient-to-br from-stone-50 to-white flex">
                    {/* Classic sidebar preview */}
                    <div className="w-12 h-full bg-white border-r border-stone-100 flex flex-col items-center gap-3 py-4">
                      <div className="w-5 h-5 rounded-full bg-stone-800" />
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded flex items-center justify-center ${
                          i === 0 ? "bg-primary/80" : "bg-transparent"
                        }`}>
                          <div className={`w-3 h-3 rounded-sm ${
                            i === 0 ? "bg-white" : "bg-stone-300"
                          }`} />
                        </div>
                      ))}
                    </div>
                    {/* Content area preview */}
                    <div className="flex-1 p-4 space-y-2">
                      <div className="w-24 h-3 bg-stone-200 rounded" />
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-8 bg-white rounded-xl border border-stone-100 shadow-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex" style={{ background: "linear-gradient(165deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)" }}>
                    {/* Premium sidebar preview */}
                    <div className="w-20 h-full border-r flex flex-col gap-2 py-3 px-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="w-4 h-4 rounded-md bg-white/20" />
                        <div className="w-8 h-2 bg-white/20 rounded" />
                      </div>
                      {["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"].map((color, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-1 py-1 rounded-lg ${
                          i === 1 ? "bg-white/10" : ""
                        }`}>
                          <div className="w-3.5 h-3.5 rounded flex items-center justify-center" style={{ background: `${color}22` }}>
                            <div className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
                          </div>
                          {i === 1 && <div className="w-8 h-1.5 rounded" style={{ background: "rgba(255,255,255,0.4)" }} />}
                          {i !== 1 && <div className="w-6 h-1.5 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />}
                        </div>
                      ))}
                    </div>
                    {/* Content area preview */}
                    <div className="flex-1 p-3 space-y-2">
                      <div className="w-16 h-2 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-6 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className={`p-4 flex items-start justify-between gap-3 ${
                  design.id === "premium"
                    ? "bg-stone-950 text-white"
                    : "bg-white"
                }`}>
                  <div>
                    <p className={`text-[11px] font-black tracking-widest uppercase ${
                      design.id === "premium" ? "text-white" : "text-stone-800"
                    }`}>{design.name}</p>
                    <p className={`text-[9px] mt-0.5 ${
                      design.id === "premium" ? "text-white/40" : "text-stone-400"
                    }`}>{design.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-[7px] font-black tracking-widest uppercase px-2 py-1 rounded-full">
                    ATIVO
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-stone-400 tracking-wider">
          💡 A mudança de design é imediata e salva apenas neste dispositivo.
        </p>
      </section>

      <div className="border-t border-primary/5" />

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
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Animações do Sistema</label><Select value={enableAnimations ? "SIM" : "NAO"} onValueChange={(v) => setEnableAnimations(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">LIGADAS</SelectItem><SelectItem value="NAO">DESLIGADAS</SelectItem></SelectContent></Select></div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Template WhatsApp</label>
              <textarea
                value={whatsappTemplate}
                onChange={e => setWhatsappTemplate(e.target.value)}
                className="w-full h-28 rounded-none bg-stone-50 border border-input px-4 py-3 text-[11px] font-mono resize-none"
                placeholder={'Use {nome}, {data}, {endereco}, {link}, {bebe}\n\nEx:\nOlá {nome}! Você foi convidado para o Chá do {bebe}!\nData: {data}\nLocal: {endereco}\nConfirme aqui: {link}'}
              />
              <p className="text-[8px] opacity-30 tracking-wider mt-1">Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{endereco}'}, {'{link}'}, {'{bebe}'}</p>
            </div>
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
          <form onSubmit={handleUpdateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest text-stone-400">Usuário</label>
              <Input 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                className="rounded-none h-12 bg-white/5 border-white/10 text-white placeholder:opacity-20" 
                placeholder="admin" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest text-stone-400">Nova Senha (deixe em branco)</label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="rounded-none h-12 bg-white/5 border-white/10 text-white placeholder:opacity-20" 
                placeholder="••••••••" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest text-stone-400">E-mail do Google (login)</label>
              <Input 
                type="email" 
                value={googleEmail} 
                onChange={e => setGoogleEmail(e.target.value)} 
                className="rounded-none h-12 bg-white/5 border-white/10 text-white placeholder:opacity-20" 
                placeholder="seu-email@gmail.com" 
              />
            </div>
            <Button 
              type="submit" 
              disabled={updatingAdmin} 
              className="h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/95 font-bold tracking-widest text-[10px] uppercase transition-all"
            >
              {updatingAdmin ? <Loader2 className="animate-spin" /> : "ATUALIZAR ACESSO"}
            </Button>
          </form>
        </Card>

        {/* Sessões e Auditoria de Acessos */}
        <Card className="border border-stone-200 shadow-xl bg-white rounded-none p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSessionTab("ACTIVE")}
                className={`text-xs font-bold tracking-widest uppercase rounded-none h-9 px-0 border-b-2 transition-all ${
                  sessionTab === "ACTIVE" 
                    ? "border-primary text-primary font-black" 
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                Dispositivos Logados ({sessions.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSessionTab("HISTORY");
                  fetchHistory();
                }}
                className={`text-xs font-bold tracking-widest uppercase rounded-none h-9 px-0 border-b-2 transition-all ${
                  sessionTab === "HISTORY" 
                    ? "border-primary text-primary font-black" 
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                Histórico de Acessos ({historyLogs.length})
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sessionTab === "ACTIVE" ? fetchSessions : fetchHistory} 
              disabled={loadingSessions || loadingHistory}
              className="text-[9px] font-bold tracking-wider rounded-none uppercase h-8 bg-stone-50 border-stone-200 ml-auto"
            >
              {(loadingSessions || loadingHistory) ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Atualizar Lista
            </Button>
          </div>

          {sessionTab === "ACTIVE" ? (
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
                            {sess.gpsCoords ? (
                              <a 
                                href={`https://www.google.com/maps?q=${sess.gpsCoords}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] text-stone-600 hover:text-primary uppercase tracking-widest font-semibold flex items-center gap-1 hover:underline transition-all"
                              >
                                📍 {sess.location} <span className="text-[7px] text-primary font-bold bg-primary/5 px-1.5 py-0.2 ml-1 rounded-none border border-primary/10 tracking-widest uppercase">MAPA</span>
                              </a>
                            ) : (
                              <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold">
                                📍 {sess.location}
                              </p>
                            )}
                            <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">
                              Última atividade: {formattedDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              try {
                                if (sess.diagnostics && sess.diagnostics !== "{}") {
                                  setSelectedDiag(JSON.parse(sess.diagnostics));
                                } else {
                                  setSelectedDiag({
                                    "Aviso": "Sessão antiga detectada",
                                    "Instrução": "Por favor, saia e faça login novamente para gerar o relatório completo",
                                    "Aparelho": sess.deviceName,
                                    "Navegador": sess.deviceInfo,
                                    "Cidade/Estado": sess.location
                                  });
                                }
                              } catch (e) {
                                setSelectedDiag({ "Status": "Não foi possível analisar os metadados" });
                              }
                            }}
                            className="text-[9px] font-bold text-stone-500 hover:text-stone-850 hover:bg-stone-50 rounded-none uppercase h-8 px-3 tracking-widest border border-stone-205 transition-all"
                          >
                            Diagnóstico
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(sess.id, sess.token)}
                            className="text-[9px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none uppercase h-8 px-3 tracking-widest border border-transparent hover:border-red-100"
                          >
                            {isCurrent ? "Sair" : "Desconectar"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {historyLogs.length === 0 ? (
                <p className="text-[10px] text-stone-400 text-center py-6 uppercase tracking-wider font-semibold">
                  Nenhum registro de histórico encontrado.
                </p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {historyLogs.map((log) => {
                    const formattedDate = new Date(log.timestamp).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });
                    const isStart = log.action === "INICIADA";

                    return (
                      <div key={log.id} className="flex items-center justify-between py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                              {log.deviceName}
                            </span>
                            <Badge className="bg-stone-100 text-stone-500 rounded-none text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">
                              {log.deviceInfo}
                            </Badge>
                            <Badge className={`rounded-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${
                              isStart 
                                ? "bg-emerald-50 text-emerald-600" 
                                : "bg-red-50 text-red-600"
                            }`}>
                              {isStart ? "🟢 INICIADA" : "🔴 FINALIZADA"}
                            </Badge>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] text-stone-500 uppercase tracking-widest font-semibold">
                              📍 {log.location}
                            </p>
                            <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">
                              Data/Hora: {formattedDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Diagnóstico Avançado */}
      {selectedDiag && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="border border-stone-200 shadow-2xl bg-white rounded-none p-8 max-w-md w-full space-y-6 relative">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-stone-800 flex items-center gap-2">
                ⚙️ DIAGNÓSTICO DE HARDWARE
              </h3>
              <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold mt-1">
                Relatório técnico detalhado do dispositivo
              </p>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {Object.entries(selectedDiag).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-stone-50 text-[10px]">
                  <span className="font-bold text-stone-500 uppercase tracking-wider">{key}</span>
                  <span className="font-semibold text-stone-800 text-right uppercase tracking-wider">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDiag(null)}
                className="text-[9px] font-bold tracking-wider rounded-none uppercase h-9 bg-stone-900 text-white hover:bg-stone-800 border-none px-6"
              >
                Fechar Relatório
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
