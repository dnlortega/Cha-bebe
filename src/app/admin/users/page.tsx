"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAdminAccounts,
  updateAdminAccountStatus,
  deleteAdminAccount,
  isMasterAdmin,
  updateAdminAllowedScreens,
  getAdminSessions,
  getSessionHistoryLogs,
} from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ShieldAlert,
  Loader2,
  Trash2,
  ShieldCheck,
  Lock,
  Users,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  History,
  UserPlus,
  Package,
  Settings,
  Info,
  CheckSquare,
  Square,
  Save,
  Search,
  UserCog,
  Wifi,
  WifiOff,
  MapPin,
  Laptop,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  Crown,
  Shield,
  Ban,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const AVAILABLE_SCREENS = [
  { name: "Dashboard",   icon: LayoutDashboard, color: "#60a5fa", desc: "Painel principal" },
  { name: "Convites",    icon: Users,            color: "#34d399", desc: "Lista de convites" },
  { name: "Histórico",   icon: History,          color: "#fbbf24", desc: "Histórico de confirmações" },
  { name: "Cadastrar",   icon: UserPlus,         color: "#f472b6", desc: "Cadastrar novos convidados" },
  { name: "Lista Final", icon: ClipboardList,    color: "#38bdf8", desc: "Lista final de confirmados" },
  { name: "Presentes",   icon: Package,          color: "#fb923c", desc: "Gerenciar lista de presentes" },
  { name: "Visual",      icon: Settings,         color: "#a78bfa", desc: "Personalização visual do site" },
  { name: "Sobre",       icon: Info,             color: "#6ee7b7", desc: "Informações do evento" },
];

const MASTER_EMAIL = process.env.NEXT_PUBLIC_MASTER_EMAIL || "dnlortega@gmail.com";

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
      <CheckCircle2 className="h-2.5 w-2.5" /> Aprovado
    </span>
  );
  if (status === "BLOCKED") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-red-50 text-red-500 border border-red-100">
      <Ban className="h-2.5 w-2.5" /> Bloqueado
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-amber-50 text-amber-500 border border-amber-100 animate-pulse">
      <Clock className="h-2.5 w-2.5" /> Pendente
    </span>
  );
}

function OnlineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
      isOnline
        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        : "bg-stone-100 text-stone-400 border border-stone-200"
    }`}>
      {isOnline
        ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Online</>
        : <><WifiOff className="h-2.5 w-2.5" /> Offline</>
      }
    </span>
  );
}

function PermissionPanel({ admin, onSaved }: { admin: any; onSaved: () => void }) {
  const initialScreens =
    admin.allowedScreens === "ALL"
      ? AVAILABLE_SCREENS.map((s) => s.name)
      : admin.allowedScreens.split(",").map((s: string) => s.trim());

  const [selected, setSelected] = useState<string[]>(initialScreens);
  const [saving, setSaving] = useState(false);

  const toggle = (name: string) => {
    if (name === "Dashboard") return;
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await updateAdminAllowedScreens(token, admin.id, selected.join(","));
    if (res.success) {
      toast.success(`✓ Permissões de ${admin.googleEmail} atualizadas!`);
      onSaved();
    } else {
      toast.error(res.error || "Erro ao salvar permissões.");
    }
    setSaving(false);
  };

  const hasChanges = selected.slice().sort().join(",") !== initialScreens.slice().sort().join(",");

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-stone-500 flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> Telas Permitidas
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelected(AVAILABLE_SCREENS.map(s => s.name))} className="text-[8px] text-primary hover:underline font-black tracking-wider uppercase">Todas</button>
          <span className="text-stone-300 text-xs">·</span>
          <button onClick={() => setSelected(["Dashboard"])} className="text-[8px] text-stone-400 hover:text-red-500 hover:underline font-black tracking-wider uppercase">Nenhuma</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AVAILABLE_SCREENS.map((screen) => {
          const isSelected = selected.includes(screen.name);
          const isFixed = screen.name === "Dashboard";
          return (
            <button
              key={screen.name}
              onClick={() => toggle(screen.name)}
              disabled={isFixed}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 text-left group ${
                isSelected
                  ? "border-transparent bg-white shadow-sm"
                  : "border-stone-200 bg-white/50 hover:border-stone-300"
              } ${isFixed ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              style={isSelected ? { borderColor: `${screen.color}33`, boxShadow: `0 2px 8px ${screen.color}15` } : {}}
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isSelected ? `${screen.color}15` : "transparent" }}>
                {isSelected
                  ? <CheckSquare className="h-3.5 w-3.5" style={{ color: screen.color }} />
                  : <Square className="h-3.5 w-3.5 text-stone-300" />
                }
              </div>
              <div className="min-w-0">
                <p className={`text-[9px] font-black tracking-wider uppercase truncate ${isSelected ? "text-stone-800" : "text-stone-400"}`}>
                  {screen.name}
                </p>
                <p className="text-[7.5px] text-stone-400 truncate">{screen.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[8px] text-stone-400">{selected.length}/{AVAILABLE_SCREENS.length} telas ativas</p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`rounded-xl text-[8.5px] font-black tracking-[0.3em] uppercase h-8 px-5 gap-1.5 transition-all ${
            hasChanges
              ? "bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          SALVAR
        </Button>
      </div>
    </div>
  );
}

function UserCard({
  admin,
  isOnline,
  activeSessions,
  onRefresh,
  isMasterEmail,
}: {
  admin: any;
  isOnline: boolean;
  activeSessions: any[];
  onRefresh: () => void;
  isMasterEmail: boolean;
}) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatus = async (status: "APPROVED" | "BLOCKED" | "PENDING") => {
    setUpdating(true);
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await updateAdminAccountStatus(token, admin.id, status);
    if (res.success) {
      const map = { APPROVED: "✓ Acesso liberado!", BLOCKED: "✗ Usuário bloqueado!", PENDING: "◷ Resetado para pendente." };
      toast.success(map[status]);
      onRefresh();
    } else {
      toast.error(res.error || "Erro ao atualizar status.");
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    setUpdating(true);
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await deleteAdminAccount(token, admin.id);
    if (res.success) {
      toast.success("Usuário removido com sucesso.");
      onRefresh();
    } else {
      toast.error(res.error || "Erro ao excluir usuário.");
    }
    setUpdating(false);
    setConfirmDelete(false);
  };

  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
  };

  const lastSession = activeSessions[0];
  const lastActivity = lastSession
    ? new Date(lastSession.lastActive).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Card className={`overflow-hidden border transition-all duration-300 hover:shadow-xl group ${
      isMasterEmail ? "border-primary/20 shadow-lg" : "border-stone-100 shadow-md"
    }`}>
      {/* Card Header */}
      <div className={`p-5 ${isMasterEmail ? "bg-gradient-to-br from-stone-950 to-stone-900" : "bg-white"}`}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {admin.avatarUrl ? (
              <div className={`w-12 h-12 rounded-2xl overflow-hidden ring-2 ${isMasterEmail ? "ring-primary/40" : "ring-stone-100"} shadow-lg`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={admin.avatarUrl} alt={admin.googleEmail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                isMasterEmail ? "bg-primary/20 ring-2 ring-primary/30" : "bg-gradient-to-br from-stone-100 to-stone-200"
              }`}>
                {isMasterEmail
                  ? <Crown className="h-6 w-6 text-primary" />
                  : <span className="text-stone-500 text-sm font-black">{getInitials(admin.googleEmail || admin.username)}</span>
                }
              </div>
            )}
            {/* Online dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              isMasterEmail ? "border-stone-950" : "border-white"
            } ${isOnline ? "bg-emerald-400" : "bg-stone-300"}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-[11px] font-black tracking-wider uppercase truncate ${isMasterEmail ? "text-white" : "text-stone-800"}`}>
                {admin.googleEmail || admin.username}
              </p>
              {isMasterEmail && <Crown className="h-3 w-3 text-primary flex-shrink-0" />}
            </div>
            <p className={`text-[9px] uppercase tracking-widest font-bold ${isMasterEmail ? "text-primary/70" : "text-stone-400"}`}>
              {isMasterEmail ? "Administrador Principal" : "Operador Secundário"}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <StatusBadge status={admin.status} />
              <OnlineBadge isOnline={isOnline} />
            </div>
          </div>
        </div>

        {/* Last activity */}
        {lastActivity && (
          <div className={`mt-4 pt-4 border-t flex items-center gap-2 ${isMasterEmail ? "border-white/5" : "border-stone-50"}`}>
            <Activity className={`h-3 w-3 flex-shrink-0 ${isMasterEmail ? "text-white/20" : "text-stone-300"}`} />
            <p className={`text-[8.5px] uppercase tracking-widest font-semibold ${isMasterEmail ? "text-white/30" : "text-stone-400"}`}>
              Última atividade: {lastActivity}
            </p>
            {lastSession?.location && (
              <>
                <span className={isMasterEmail ? "text-white/10" : "text-stone-200"}>·</span>
                <MapPin className={`h-3 w-3 flex-shrink-0 ${isMasterEmail ? "text-white/20" : "text-stone-300"}`} />
                <p className={`text-[8.5px] uppercase tracking-widest font-semibold truncate ${isMasterEmail ? "text-white/30" : "text-stone-400"}`}>
                  {lastSession.location}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 bg-white">
        {isMasterEmail ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-[9px] font-black tracking-widest uppercase text-primary/80">Proprietário do Sistema — Acesso Total</p>
          </div>
        ) : (
          <>
            {/* Actions Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {admin.status !== "APPROVED" && (
                <Button size="sm" onClick={() => handleStatus("APPROVED")} disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[8.5px] font-black tracking-wider uppercase h-8 px-3 gap-1.5 shadow-sm">
                  <CheckCircle2 className="h-3 w-3" /> Aprovar
                </Button>
              )}
              {admin.status !== "BLOCKED" && (
                <Button size="sm" onClick={() => handleStatus("BLOCKED")} disabled={updating}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-[8.5px] font-black tracking-wider uppercase h-8 px-3 gap-1.5 shadow-sm">
                  <Ban className="h-3 w-3" /> Bloquear
                </Button>
              )}
              {admin.status === "BLOCKED" && (
                <Button size="sm" onClick={() => handleStatus("PENDING")} disabled={updating}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[8.5px] font-black tracking-wider uppercase h-8 px-3 gap-1.5 shadow-sm">
                  <AlertTriangle className="h-3 w-3" /> Resetar
                </Button>
              )}

              <div className="flex-1" />

              {/* Session button */}
              {activeSessions.length > 0 && (
                <button
                  onClick={() => setShowSessions(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8.5px] font-black tracking-widest uppercase transition-all ${
                    showSessions ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  <Laptop className="h-3 w-3" />
                  Última Sessão
                  <ChevronDown className={`h-3 w-3 transition-transform ${showSessions ? "rotate-180" : ""}`} />
                </button>
              )}

              {/* Permissions button */}
              {admin.status === "APPROVED" && (
                <button
                  onClick={() => setShowPermissions(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8.5px] font-black tracking-widest uppercase transition-all ${
                    showPermissions ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  <Shield className="h-3 w-3" /> Telas
                  <ChevronDown className={`h-3 w-3 transition-transform ${showPermissions ? "rotate-180" : ""}`} />
                </button>
              )}

              {/* Delete */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                  <span className="text-[8px] font-black uppercase text-red-500 tracking-wider">Confirmar?</span>
                  <button onClick={handleDelete} disabled={updating} className="text-[8px] font-black uppercase text-red-600 hover:underline">Sim</button>
                  <span className="text-red-200">·</span>
                  <button onClick={() => setConfirmDelete(false)} className="text-[8px] font-black uppercase text-stone-400 hover:underline">Não</button>
                </div>
              )}
            </div>

            {/* Permissions Panel */}
            {showPermissions && admin.status === "APPROVED" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <PermissionPanel admin={admin} onSaved={() => { setShowPermissions(false); }} />
              </div>
            )}

            {/* Sessions Panel - only most recent */}
            {showSessions && activeSessions[0] && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[8px] font-black tracking-[0.3em] uppercase text-stone-400 flex items-center gap-1.5">
                  <Wifi className="h-3 w-3" /> Última Sessão Ativa
                </p>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[10px] font-bold text-stone-700 truncate">{activeSessions[0].deviceName}</p>
                    <p className="text-[8px] text-stone-400 uppercase tracking-widest">{activeSessions[0].deviceInfo} · {activeSessions[0].location}</p>
                  </div>
                  <span className="text-[7px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex-shrink-0">
                    Ativo
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function UsersPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "BLOCKED">("ALL");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkPermissionAndLoad();
  }, []);

  const checkPermissionAndLoad = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_session_token") || "";
    const isMaster = await isMasterAdmin(token);
    if (!isMaster) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    setAuthorized(true);
    await loadAll();
  };

  const loadAll = useCallback(async () => {
    const token = localStorage.getItem("admin_session_token") || "";
    const [adminsRes, sessionsRes] = await Promise.all([
      getAdminAccounts(token),
      getAdminSessions(),
    ]);
    if (adminsRes.success && adminsRes.admins) {
      setAdmins(adminsRes.admins);
    }
    setSessions(sessionsRes);
    setLoading(false);
    setRefreshing(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
  };

  const getSessionsForEmail = (email: string) =>
    sessions.filter(s => s.adminEmail?.toLowerCase() === email.toLowerCase());

  const isOnline = (email: string) => getSessionsForEmail(email).length > 0;

  const filteredAdmins = admins
    .filter(a => filter === "ALL" || a.status === filter)
    .filter(a => !search || (a.googleEmail || a.username || "").toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: admins.length,
    approved: admins.filter(a => a.status === "APPROVED").length,
    pending: admins.filter(a => a.status === "PENDING").length,
    blocked: admins.filter(a => a.status === "BLOCKED").length,
    online: admins.filter(a => isOnline(a.googleEmail || "")),
  };

  // ---- Guard States ----

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in duration-700">
          <div className="h-2 w-full bg-red-600" />
          <div className="pt-16 pb-16 px-12 text-center space-y-8">
            <div className="w-20 h-20 bg-stone-900 mx-auto flex items-center justify-center rotate-45 transition-all duration-700 shadow-2xl relative overflow-hidden group hover:rotate-0">
              <div className="-rotate-45 group-hover:rotate-0 transition-all duration-700 w-full h-full p-2 flex items-center justify-center">
                <Lock className="h-8 w-8 text-red-500 animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-serif tracking-[0.2em] text-red-600 uppercase">Área Restrita</h2>
              <p className="text-[9px] opacity-40 tracking-[0.5em] uppercase font-light">Acesso Negado</p>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500 font-medium">
              Esta tela é exclusiva do administrador principal (
              <span className="font-bold text-stone-700">dnlortega@gmail.com</span>).
            </p>
            <Button onClick={() => (window.location.href = "/admin")}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 text-[10px] tracking-[0.4em] rounded-none transition-all">
              VOLTAR AO DASHBOARD
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Main UI ----

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-700 pb-24">

      {/* Header */}
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-primary/8 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <h1 className="text-4xl md:text-5xl font-serif text-stone-800 tracking-tight">Usuários</h1>
            </div>
            <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light ml-5">
              Gerenciamento de Acessos · {stats.total} conta{stats.total !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border border-primary/20 bg-white/50 backdrop-blur-sm hover:bg-primary hover:text-white transition-all shadow-sm rounded-xl h-11 px-6 group"
          >
            <RefreshCw className={`h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors ${refreshing ? "animate-spin" : ""}`} />
            <span className="text-[10px] tracking-widest uppercase font-bold">Atualizar</span>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-stone-600", bg: "bg-stone-50", border: "border-stone-100" },
            { label: "Aprovados", value: stats.approved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Pendentes", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Online Agora", value: stats.online.length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex flex-col gap-1`}>
              <p className={`text-3xl font-serif ${s.color} leading-none`}>{s.value}</p>
              <p className={`text-[9px] font-black tracking-widest uppercase ${s.color} opacity-70`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Online Users */}
        {stats.online.length > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-700">
              {stats.online.length} admin{stats.online.length > 1 ? "s" : ""} online agora:&nbsp;
              {stats.online.map((a: any) => a.googleEmail?.split("@")[0]).join(", ")}
            </p>
          </div>
        )}
      </header>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 pointer-events-none" />
          <Input
            placeholder="Pesquisar por e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-stone-200 bg-white text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Todos", value: "ALL" },
            { label: "Aprovados", value: "APPROVED" },
            { label: "Pendentes", value: "PENDING" },
            { label: "Bloqueados", value: "BLOCKED" },
          ].map(tab => (
            <Button
              key={tab.value}
              variant="outline"
              size="sm"
              onClick={() => setFilter(tab.value as any)}
              className={`text-[9px] font-black tracking-wider rounded-xl uppercase h-11 px-4 transition-all ${
                filter === tab.value
                  ? "bg-stone-900 text-white border-stone-900 shadow-md"
                  : "bg-white text-stone-500 hover:text-stone-800 border-stone-200"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* User Cards Grid */}
      {filteredAdmins.length === 0 ? (
        <div className="py-24 text-center space-y-4 border border-dashed border-stone-200 rounded-3xl">
          <Users className="h-10 w-10 text-stone-200 mx-auto" />
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
            {search ? `Nenhum resultado para "${search}"` : "Nenhuma conta encontrada"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAdmins.map(admin => {
            const email = admin.googleEmail || "";
            const isMasterEmail = email.toLowerCase() === MASTER_EMAIL.toLowerCase();
            const adminSessions = getSessionsForEmail(email);
            return (
              <UserCard
                key={admin.id}
                admin={admin}
                isOnline={isOnline(email)}
                activeSessions={adminSessions}
                onRefresh={loadAll}
                isMasterEmail={isMasterEmail}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
