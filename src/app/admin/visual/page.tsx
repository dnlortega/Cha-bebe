"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminCredentials, getAdminSessions, revokeAdminSession, getSessionHistoryLogs, getAdminCredentials } from "@/app/actions";
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
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

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
    }
  }, []);

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
    const result = await updateSettings({ invitationUrl, theme, inviteFont, inviteFontSize, systemFont, systemFontSize, showInvitationImage, babyName, babyGender, eventDate, eventAddress, eventMapsUrl, enableAnimations });
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
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Animações do Sistema</label><Select value={enableAnimations ? "SIM" : "NAO"} onValueChange={(v) => setEnableAnimations(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">LIGADAS</SelectItem><SelectItem value="NAO">DESLIGADAS</SelectItem></SelectContent></Select></div>
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
