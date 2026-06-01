"use client";

import {
  CalendarPlus,
  Palette,
  UserPlus,
  Gift,
  Share2,
  Sparkles,
  ArrowDown,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const STEPS = [
  {
    icon: CalendarPlus,
    title: "Crie seu primeiro evento",
    description:
      "Use «Compartilhar» para dar acesso a quem já entrou no painel com Google. Depois clique em «Criar meu primeiro evento» — convite, tema e configurações já vêm prontos.",
  },
  {
    icon: Palette,
    title: "Personalize o visual",
    description:
      "No painel, abra Visual para alterar cores, fontes, foto do convite, data, endereço e nome do bebê.",
  },
  {
    icon: UserPlus,
    title: "Cadastre os convidados",
    description:
      "Use Cadastrar para incluir famílias ou convidados individuais. Em Convites você acompanha confirmações e recados.",
  },
  {
    icon: Gift,
    title: "Monte a lista de presentes",
    description:
      "Em Presentes, adicione itens e categorias. Os convidados escolhem na hora de confirmar presença.",
  },
  {
    icon: Share2,
    title: "Envie os links",
    description:
      "Cada convidado recebe um link exclusivo (ex.: seusite.com/seu-evento/nome-do-convidado). O mural público fica em /seu-evento/mural.",
  },
] as const;

type EventsOnboardingProps = {
  creating: boolean;
  shareCount: number;
  onCreate: () => void;
};

export function EventsOnboarding({
  creating,
  shareCount,
  onCreate,
}: EventsOnboardingProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 via-white to-primary/10 overflow-hidden">
        <CardContent className="p-8 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-14 h-14 shrink-0 bg-primary/15 rounded-full flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <p className="text-[10px] tracking-[0.45em] uppercase text-primary/70 font-medium">
                Primeiro acesso
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif text-primary tracking-[0.15em] uppercase leading-snug">
                Bem-vindo ao seu painel
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                Você ainda não tem um evento ativo. Por isso ficará nesta tela até criar o
                primeiro — assim garantimos que convidados, presentes e configurações fiquem
                organizados no lugar certo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-left">
            <Users className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900/90 leading-relaxed">
              <span className="font-semibold">Dica:</span> as outras áreas do menu (Dashboard,
              Convites, Presentes…) só liberam depois que você criar e entrar em um evento.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-medium px-1">
          Como funciona — em 5 passos
        </h3>
        <ol className="grid gap-4 sm:grid-cols-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isFirst = index === 0;
            return (
              <li
                key={step.title}
                className={`flex gap-4 p-5 rounded-lg border bg-white shadow-sm transition-colors ${
                  isFirst
                    ? "border-primary/30 ring-1 ring-primary/10"
                    : "border-stone-100"
                }`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold tracking-wider ${
                      isFirst
                        ? "bg-primary text-primary-foreground"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div
                    className={`p-2 rounded-lg ${
                      isFirst ? "bg-primary/10" : "bg-stone-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isFirst ? "text-primary" : "text-stone-400"
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0 pt-0.5">
                  <h4 className="text-sm font-serif tracking-widest text-primary uppercase">
                    {step.title}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Card className="border-2 border-dashed border-primary/25 bg-primary/[0.02] shadow-none">
        <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-6">
          <ArrowDown className="h-5 w-5 text-primary/40 animate-bounce" />
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-serif tracking-[0.2em] text-primary uppercase">
              Pronto para começar?
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              O botão abaixo cria seu evento e abre o painel automaticamente. Leva poucos
              segundos.
            </p>
            {shareCount > 0 && (
              <p className="text-[10px] text-stone-400 tracking-wide pt-1">
                {shareCount === 1
                  ? "1 e-mail receberá acesso de editor ao criar o evento."
                  : `${shareCount} e-mails receberão acesso de editor ao criar o evento.`}
              </p>
            )}
          </div>
          <Button
            onClick={onCreate}
            disabled={creating}
            size="lg"
            className="rounded-none h-14 px-10 text-[11px] tracking-[0.35em] uppercase font-bold shadow-lg"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Criando evento…
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Criar meu primeiro evento
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
