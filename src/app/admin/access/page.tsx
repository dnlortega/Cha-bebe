"use client";

import { useState, useEffect, useRef } from "react";
import {
  getAdminAccounts,
  updateAdminAccountStatus,
  deleteAdminAccount,
  isMasterAdmin,
  updateAdminAllowedScreens,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

// Todas as telas disponíveis para concessão (exceto Acessos, que é exclusivo do master)
const AVAILABLE_SCREENS = [
  { name: "Dashboard",   icon: LayoutDashboard, desc: "Painel principal" },
  { name: "Convites",    icon: Users,            desc: "Lista de convites" },
  { name: "Histórico",   icon: History,          desc: "Histórico de confirmações" },
  { name: "Cadastrar",   icon: UserPlus,         desc: "Cadastrar novos convidados" },
  { name: "Lista Final", icon: ClipboardList,    desc: "Lista final de confirmados" },
  { name: "Presentes",   icon: Package,          desc: "Gerenciar lista de presentes" },
  { name: "Visual",      icon: Settings,         desc: "Personalização visual do site" },
  { name: "Sobre",       icon: Info,             desc: "Informações do evento" },
];

function ScreenPermissionPanel({
  admin,
  onSaved,
}: {
  admin: any;
  onSaved: () => void;
}) {
  const initialScreens =
    admin.allowedScreens === "ALL"
      ? AVAILABLE_SCREENS.map((s) => s.name)
      : admin.allowedScreens.split(",").map((s: string) => s.trim());

  const [selected, setSelected] = useState<string[]>(initialScreens);
  const [saving, setSaving] = useState(false);

  const toggle = (name: string) => {
    // Dashboard não pode ser desmarcado
    if (name === "Dashboard") return;
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const selectAll = () => setSelected(AVAILABLE_SCREENS.map((s) => s.name));
  const clearAll = () => setSelected(["Dashboard"]); // Dashboard sempre fica

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("admin_session_token") || "";
    const screens = selected.join(",");
    const res = await updateAdminAllowedScreens(token, admin.id, screens);
    if (res.success) {
      toast.success(`✓ Permissões de ${admin.googleEmail} salvas!`);
      onSaved();
    } else {
      toast.error(res.error || "Erro ao salvar permissões.");
    }
    setSaving(false);
  };

  const hasChanges =
    selected.slice().sort().join(",") !==
    initialScreens.slice().sort().join(",");

  return (
    <div className="border-t border-stone-100 mt-4 pt-5 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black tracking-[0.4em] uppercase text-stone-500">
          Telas Permitidas
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={selectAll}
            className="text-[8px] text-primary hover:underline tracking-wider uppercase font-bold"
          >
            Todas
          </button>
          <span className="text-stone-300 text-[10px]">·</span>
          <button
            onClick={clearAll}
            className="text-[8px] text-stone-400 hover:text-red-500 hover:underline tracking-wider uppercase font-bold"
          >
            Nenhuma
          </button>
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
              className={`flex items-center gap-2 p-2.5 border transition-all duration-200 text-left rounded-none group ${
                isSelected
                  ? "border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10"
                  : "border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 hover:border-stone-200 dark:hover:border-stone-700"
              } ${isFixed ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-sm"}`}
            >
              {isSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-primary dark:text-primary flex-shrink-0" />
              ) : (
                <Square className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700 flex-shrink-0 group-hover:text-stone-400 dark:group-hover:text-stone-600" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-[9px] font-black tracking-wider uppercase truncate ${
                    isSelected ? "text-primary dark:text-primary" : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {screen.name}
                </p>
                <p className="text-[7.5px] text-stone-400 dark:text-stone-500 truncate">{screen.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[8px] text-stone-400">
          {selected.length}/{AVAILABLE_SCREENS.length} telas liberadas
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`rounded-none text-[8.5px] font-bold tracking-[0.3em] uppercase h-8 px-4 gap-1.5 transition-all ${
            hasChanges
              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100"
              : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          SALVAR
        </Button>
      </div>
    </div>
  );
}

export default function AccessPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "BLOCKED">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    await loadAdmins();
  };

  const loadAdmins = async () => {
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await getAdminAccounts(token);
    if (res.success && res.admins) {
      setAdmins(res.admins);
    } else {
      toast.error(res.error || "Erro ao carregar administradores.");
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (adminId: string, status: "APPROVED" | "BLOCKED" | "PENDING") => {
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await updateAdminAccountStatus(token, adminId, status);
    if (res.success) {
      const statusMap = {
        APPROVED: "✓ ACESSO LIBERADO!",
        BLOCKED: "✗ USUÁRIO BLOQUEADO!",
        PENDING: "◷ COLOCADO EM ESPERA.",
      };
      toast.success(statusMap[status]);
      await loadAdmins();
    } else {
      toast.error(res.error || "Erro ao atualizar status.");
    }
  };

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Excluir permanentemente o acesso de ${email}?`)) return;
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await deleteAdminAccount(token, adminId);
    if (res.success) {
      toast.success("Acesso excluído com sucesso.");
      await loadAdmins();
    } else {
      toast.error(res.error || "Erro ao excluir administrador.");
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none rounded-none text-[7.5px] font-black tracking-widest px-2 py-0.5">
            APROVADO
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-red-50 text-red-500 hover:bg-red-50 border-none rounded-none text-[7.5px] font-black tracking-widest px-2 py-0.5">
            BLOQUEADO
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-500 hover:bg-amber-50 border-none rounded-none text-[7.5px] font-black tracking-widest px-2 py-0.5 animate-pulse">
            PENDENTE
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center dark:bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-white dark:bg-stone-950 rounded-none overflow-hidden animate-in fade-in duration-700">
          <div className="h-2 w-full bg-red-600" />
          <CardContent className="pt-16 pb-16 px-12 text-center space-y-8">
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
              Este painel de gerenciamento de permissões é exclusivo do administrador principal (
              <span className="font-bold text-stone-700">dnlortega@gmail.com</span>).
            </p>
            <Button
              onClick={() => (window.location.href = "/admin")}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 text-[10px] tracking-[0.4em] rounded-none transition-all"
            >
              VOLTAR AO DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const masterEmail = "dnlortega@gmail.com";

  return (
    <div className="max-w-5xl space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-primary/5 pb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Permissões</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">
            Controle de Acesso · Telas por Usuário
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Todos", value: "ALL" },
            { label: "Pendentes", value: "PENDING" },
            { label: "Aprovados", value: "APPROVED" },
            { label: "Bloqueados", value: "BLOCKED" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant="outline"
              size="sm"
              onClick={() => setFilter(tab.value as any)}
              className={`text-[9px] font-bold tracking-wider rounded-none uppercase h-9 px-4 transition-all ${
                filter === tab.value
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-500 hover:text-stone-800 border-stone-200"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Grid de contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAdmins.map((admin) => {
          const isMasterUser = admin.googleEmail?.toLowerCase() === masterEmail.toLowerCase();
          const isExpanded = expandedId === admin.id;

          return (
            <Card
              key={admin.id}
              className={`border border-stone-100 shadow-xl rounded-none bg-white relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                isMasterUser ? "ring-1 ring-primary/20 bg-gradient-to-br from-white to-stone-50/30" : ""
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Header do card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar / ícone */}
                    {admin.avatarUrl ? (
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full overflow-hidden shadow-md ${isMasterUser ? "ring-2 ring-primary/40" : "ring-1 ring-stone-200"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={admin.avatarUrl}
                            alt={admin.googleEmail}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {isMasterUser && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                            <ShieldCheck className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-none flex items-center justify-center ${isMasterUser ? "bg-primary/10 border border-primary/20" : "bg-stone-50 border border-stone-100"}`}>
                        {isMasterUser ? (
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                    )}

                    <div className="space-y-0.5 min-w-0">
                      <p
                        className="text-[11px] font-black uppercase tracking-wider text-stone-800 truncate max-w-[200px]"
                        title={admin.googleEmail || admin.username}
                      >
                        {admin.googleEmail || admin.username}
                      </p>
                      <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold">
                        {isMasterUser ? "Administrador Principal" : "Operador Secundário"}
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(admin.status)}
                </div>

                {/* Ações */}
                {isMasterUser ? (
                  <div className="pt-3 border-t border-stone-50">
                    <Badge className="bg-primary/5 text-primary border border-primary/10 rounded-none text-[8px] font-bold tracking-widest px-2.5 py-1 w-full text-center block uppercase">
                      PROPRIETÁRIO DO SISTEMA — ACESSO TOTAL
                    </Badge>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-stone-50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {admin.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(admin.id, "APPROVED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[8.5px] font-bold tracking-wider uppercase h-8 px-3"
                          >
                            APROVAR
                          </Button>
                        )}
                        {admin.status !== "BLOCKED" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(admin.id, "BLOCKED")}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-none text-[8.5px] font-bold tracking-wider uppercase h-8 px-3"
                          >
                            BLOQUEAR
                          </Button>
                        )}
                        {admin.status === "BLOCKED" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(admin.id, "PENDING")}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-none text-[8.5px] font-bold tracking-wider uppercase h-8 px-3"
                          >
                            RESETAR
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Botão de telas (acordeão) */}
                        {admin.status === "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : admin.id)}
                            className={`rounded-none text-[8.5px] font-bold tracking-wider uppercase h-8 px-3 transition-all gap-1.5 ${
                              isExpanded
                                ? "bg-stone-900 text-white border-stone-900"
                                : "border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-400"
                            }`}
                          >
                            TELAS
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAdmin(admin.id, admin.googleEmail || admin.username)}
                          className="text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-none h-8 w-8 border border-transparent hover:border-red-100 transition-all"
                          title="Excluir Registro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Painel de telas (acordeão) */}
                    {isExpanded && admin.status === "APPROVED" && (
                      <ScreenPermissionPanel
                        admin={admin}
                        onSaved={loadAdmins}
                      />
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filteredAdmins.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-stone-200 rounded-none">
            <ShieldAlert className="h-8 w-8 text-stone-300 mx-auto mb-3 animate-pulse" />
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
              Nenhuma solicitação encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
