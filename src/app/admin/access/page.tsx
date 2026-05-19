"use client";

import { useState, useEffect } from "react";
import { getAdminAccounts, updateAdminAccountStatus, deleteAdminAccount, isMasterAdmin } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ShieldAlert, Loader2, CheckCircle2, XCircle, Trash2, 
  UserCheck, Clock, ShieldX, ShieldCheck, Lock, Users 
} from "lucide-react";

export default function AccessPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "BLOCKED">("ALL");

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
        APPROVED: "ACESSO LIBERADO COM SUCESSO!",
        BLOCKED: "USUÁRIO BLOQUEADO COM SUCESSO!",
        PENDING: "USUÁRIO COLOCADO EM ESPERA."
      };
      toast.success(statusMap[status]);
      await loadAdmins();
    } else {
      toast.error(res.error || "Erro ao atualizar status.");
    }
  };

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o acesso de ${email}?`)) {
      return;
    }
    
    const token = localStorage.getItem("admin_session_token") || "";
    const res = await deleteAdminAccount(token, adminId);
    
    if (res.success) {
      toast.success("ACESSO EXCLUÍDO COM SUCESSO.");
      await loadAdmins();
    } else {
      toast.error(res.error || "Erro ao excluir administrador.");
    }
  };

  const filteredAdmins = admins.filter(a => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none rounded-none text-[8px] font-bold tracking-widest px-2 py-0.5">
            APROVADO
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none rounded-none text-[8px] font-bold tracking-widest px-2 py-0.5">
            BLOQUEADO
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-none rounded-none text-[8px] font-bold tracking-widest px-2 py-0.5 animate-pulse">
            PENDENTE
          </Badge>
        );
    }
  };

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
        <Card className="w-full max-w-md border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white rounded-none overflow-hidden animate-in fade-in duration-700">
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
              Este painel de gerenciamento de permissões é exclusivo do administrador principal (<span className="font-bold text-stone-700">dnlortega@gmail.com</span>).
            </p>
            <Button
              onClick={() => window.location.href = "/admin"}
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
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-primary/5 pb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Permissões</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Controle de Acesso Google Sign-In</p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Todos", value: "ALL" },
            { label: "Pendentes", value: "PENDING" },
            { label: "Aprovados", value: "APPROVED" },
            { label: "Bloqueados", value: "BLOCKED" }
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

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => {
          const isMasterUser = admin.googleEmail?.toLowerCase() === masterEmail.toLowerCase();
          
          return (
            <Card 
              key={admin.id}
              className={`border border-stone-100 shadow-xl rounded-none bg-white p-6 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between min-h-[190px] ${
                isMasterUser ? "ring-1 ring-primary/20 bg-gradient-to-br from-white to-stone-50/20" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-stone-50 rounded-none border border-primary/5">
                    {isMasterUser ? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Users className="h-5 w-5 text-stone-400" />
                    )}
                  </div>
                  {getStatusBadge(admin.status)}
                </div>

                <div className="space-y-1">
                  <h3 className="text-[12px] font-black uppercase tracking-wider text-stone-800 truncate" title={admin.googleEmail || admin.username}>
                    {admin.googleEmail || admin.username}
                  </h3>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold">
                    {isMasterUser ? "Administrador Principal" : "Operador Secundário"}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-50 mt-4 flex items-center justify-between gap-2">
                {isMasterUser ? (
                  <Badge className="bg-primary/5 text-primary border border-primary/10 rounded-none text-[8px] font-bold tracking-widest px-2.5 py-1 w-full text-center block uppercase">
                    PROPRIETÁRIO DO SISTEMA
                  </Badge>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {admin.status !== "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(admin.id, "APPROVED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[9px] font-bold tracking-wider uppercase h-8 px-2.5"
                          title="Aprovar Acesso"
                        >
                          APROVAR
                        </Button>
                      )}
                      
                      {admin.status !== "BLOCKED" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(admin.id, "BLOCKED")}
                          className="bg-red-550 hover:bg-red-600 bg-red-600 text-white rounded-none text-[9px] font-bold tracking-wider uppercase h-8 px-2.5"
                          title="Bloquear Acesso"
                        >
                          BLOQUEAR
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAdmin(admin.id, admin.googleEmail || admin.username)}
                      className="text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-none h-8 w-8 border border-transparent hover:border-red-100 transition-all"
                      title="Excluir Registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
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
