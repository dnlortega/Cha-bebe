"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, UserCheck, Check } from "lucide-react";
import { toast } from "sonner";
import {
  getRegisteredUsersForSharing,
  shareEventWithRegisteredUser,
  type RegisteredUserForShare,
} from "@/app/eventActions";
import { EVENT_SHARE_INCLUDES_DESCRIPTION } from "@/lib/eventAccess";

type ShareEventDialogProps = {
  ownerEmail: string;
  eventId?: string;
  eventName?: string;
  /** Após compartilhar em evento existente */
  onShared?: (email: string) => void;
  /** Modo criação: só adiciona e-mail à lista local */
  onPickForCreate?: (email: string) => void;
  alreadySharedEmails?: string[];
  triggerClassName?: string;
};

export function ShareEventDialog({
  ownerEmail,
  eventId,
  eventName,
  onShared,
  onPickForCreate,
  alreadySharedEmails = [],
  triggerClassName,
}: ShareEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [users, setUsers] = useState<RegisteredUserForShare[]>([]);

  const isCreateMode = !eventId && !!onPickForCreate;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await getRegisteredUsersForSharing(ownerEmail, eventId);
        if (!cancelled) setUsers(list);
      } catch {
        if (!cancelled) toast.error("Erro ao carregar usuários cadastrados.");
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, ownerEmail, eventId]);

  const isAlreadyShared = (email: string) => {
    const normalized = email.toLowerCase();
    if (alreadySharedEmails.some((e) => e.toLowerCase() === normalized)) return true;
    return users.find((u) => u.email === normalized)?.alreadyShared ?? false;
  };

  const handleShare = async (user: RegisteredUserForShare) => {
    if (isAlreadyShared(user.email)) {
      toast.info("Este usuário já tem acesso ao evento.");
      return;
    }

    if (isCreateMode) {
      onPickForCreate!(user.email);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, alreadyShared: true } : u
        )
      );
      toast.success(`${user.email} será incluído ao criar o evento.`);
      return;
    }

    setSharingId(user.id);
    const result = await shareEventWithRegisteredUser(
      eventId!,
      user.id,
      ownerEmail
    );
    setSharingId(null);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, alreadyShared: true } : u
        )
      );
      onShared?.(user.email);
      toast.success(`Evento compartilhado com ${user.email}`);
    } else {
      toast.error(result.error || "Não foi possível compartilhar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`rounded-none text-[10px] tracking-widest uppercase h-9 ${triggerClassName ?? ""}`}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Compartilhar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-none border-primary/10">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-widest text-primary uppercase text-base">
            Compartilhar evento
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 space-y-2">
            {eventName ? (
              <span>
                Escolha um usuário <span className="font-medium">já cadastrado</span>{" "}
                para colaborar em «{eventName}».
              </span>
            ) : (
              <span>
                Escolha um usuário <span className="font-medium">já cadastrado</span>{" "}
                para receber acesso de editor ao criar o evento.
              </span>
            )}
            <span className="block text-[10px] text-stone-400 leading-relaxed pt-1 border-t border-stone-100">
              O colaborador poderá gerenciar: {EVENT_SHARE_INCLUDES_DESCRIPTION}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60vh,320px)] overflow-y-auto -mx-1 px-1 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-8 leading-relaxed">
              Nenhum outro usuário aprovado com login Google foi encontrado. Peça
              para a pessoa entrar uma vez no painel com o Google — depois ela
              aparecerá aqui.
            </p>
          ) : (
            users.map((user) => {
              const shared = isAlreadyShared(user.email);
              const busy = sharingId === user.id;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {(user.email[0] || "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">
                      {user.email}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">
                      {user.username}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={shared ? "ghost" : "default"}
                    disabled={shared || busy}
                    onClick={() => handleShare(user)}
                    className="rounded-none h-8 text-[9px] tracking-wider uppercase shrink-0"
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : shared ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Ok
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Dar acesso
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
