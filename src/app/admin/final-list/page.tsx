"use client";

import { useState, useEffect, useMemo } from "react";
import { getGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  Copy,
  Printer,
  CheckCircle2,
  Circle,
  Search,
  X,
  Gift,
  Package,
  RotateCcw,
  DoorOpen,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

const CHECKIN_STORAGE_KEY = "portaria_checkin_state";

export default function FinalListPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "arrived">("all");

  useEffect(() => {
    // Restaura check-ins salvos no localStorage (para persistir no dispositivo da portaria)
    try {
      const saved = localStorage.getItem(CHECKIN_STORAGE_KEY);
      if (saved) setCheckedIn(JSON.parse(saved));
    } catch {}
    fetchGuests();
    const interval = setInterval(fetchGuests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const confirmedGuests = guests.filter((g) => g.status_confirmacao === "CONFIRMED");

  // Lista expandida de pessoas (considera famílias)
  const confirmedPeopleList = useMemo(() => {
    const list: { id: string; name: string; groupName: string; tipo: string }[] = [];
    confirmedGuests.forEach((g) => {
      if (g.tipo === "FAMILIA" && g.membros_confirmados) {
        g.membros_confirmados
          .split(",")
          .map((n: string) => n.trim())
          .filter(Boolean)
          .forEach((n: string, idx: number) => {
            list.push({
              id: `${g.id}_${idx}`,
              name: n,
              groupName: g.nome,
              tipo: "FAMILIA",
            });
          });
      } else {
        list.push({ id: g.id, name: g.nome, groupName: g.nome, tipo: "INDIVIDUAL" });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [confirmedGuests]);

  const filteredPeople = useMemo(() => {
    let list = confirmedPeopleList;

    if (search.trim()) {
      const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      list = list.filter((p) =>
        p.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(q)
      );
    }

    if (activeTab === "arrived") list = list.filter((p) => checkedIn[p.id]);
    if (activeTab === "waiting") list = list.filter((p) => !checkedIn[p.id]);

    return list;
  }, [confirmedPeopleList, search, activeTab, checkedIn]);

  const arrivedCount = confirmedPeopleList.filter((p) => checkedIn[p.id]).length;
  const totalCount = confirmedPeopleList.length;
  const waitingCount = totalCount - arrivedCount;

  const toggleCheckIn = (personId: string, personName: string) => {
    const newState = { ...checkedIn, [personId]: !checkedIn[personId] };
    setCheckedIn(newState);
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(newState));
    if (!checkedIn[personId]) {
      toast.success(`✓ ${personName} chegou!`, { duration: 1500 });
    }
  };

  const resetCheckins = () => {
    if (!confirm("Zerar todos os check-ins? Esta ação não pode ser desfeita.")) return;
    setCheckedIn({});
    localStorage.removeItem(CHECKIN_STORAGE_KEY);
    toast.success("Check-ins zerados.");
  };

  const copyFullGuestList = () => {
    if (confirmedPeopleList.length === 0) return toast.error("SEM CONFIRMAÇÕES.");
    navigator.clipboard.writeText(confirmedPeopleList.map((p) => p.name).join("\n"));
    toast.success("LISTA COPIADA!");
  };

  const totalAdults = confirmedGuests.reduce((acc, g) => acc + (g.qtd_adultos || 0), 0);
  const totalChildren = confirmedGuests.reduce((acc, g) => acc + (g.qtd_criancas || 0), 0);
  const giftsReserved = confirmedGuests.filter((g) => g.gift?.name).map((g) => ({ guest: g.nome, gift: g.gift.name }));
  const diapersList = confirmedGuests.filter((g) => g.fralda_tamanho).map((g) => ({ guest: g.nome, size: g.fralda_tamanho }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-primary/5 pb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Checklist Final</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">
            Controle de Portaria · Dia do Evento
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={copyFullGuestList} variant="outline" className="rounded-none h-10 px-5 tracking-widest text-[9px] uppercase">
            <Copy className="mr-2 h-3.5 w-3.5" /> Copiar
          </Button>
          <Button onClick={resetCheckins} variant="outline" className="rounded-none h-10 px-5 tracking-widest text-[9px] uppercase text-red-500 border-red-200 hover:bg-red-50">
            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Zerar
          </Button>
          <Button onClick={() => window.print()} className="rounded-none h-10 px-5 tracking-widest text-[9px] uppercase shadow-lg">
            <Printer className="mr-2 h-3.5 w-3.5" /> Imprimir
          </Button>
        </div>
      </header>

      {/* Cards de Resumo (Portaria) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-100 shadow-lg p-6 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-stone-200" />
          <p className="text-[8.5px] opacity-40 uppercase tracking-widest font-semibold">Total Confirmados</p>
          <p className="text-3xl font-serif text-stone-700">{totalCount}</p>
          <p className="text-[8px] text-stone-400 uppercase tracking-wider">pessoas</p>
        </div>
        <div className="bg-white border border-emerald-100 shadow-lg p-6 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <p className="text-[8.5px] text-emerald-600 uppercase tracking-widest font-semibold opacity-70">Chegaram</p>
          <p className="text-3xl font-serif text-emerald-600">{arrivedCount}</p>
          <p className="text-[8px] text-emerald-400 uppercase tracking-wider">check-in feito</p>
        </div>
        <div className="bg-white border border-amber-100 shadow-lg p-6 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
          <p className="text-[8.5px] text-amber-600 uppercase tracking-widest font-semibold opacity-70">Aguardando</p>
          <p className="text-3xl font-serif text-amber-500">{waitingCount}</p>
          <p className="text-[8px] text-amber-400 uppercase tracking-wider">ainda não chegaram</p>
        </div>
      </div>

      {/* Barra de progresso */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-[9px] text-stone-400 uppercase tracking-widest">
            <span>Progresso de Chegada</span>
            <span>{Math.round((arrivedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 bg-stone-100 w-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
              style={{ width: `${(arrivedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista Principal de Check-In */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar convidado..."
              className="rounded-none border-stone-200 pl-11 pr-10 h-12 text-[11px] tracking-wider uppercase placeholder:text-stone-300 placeholder:normal-case focus-visible:ring-primary/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabs de filtro */}
          <div className="flex gap-1.5">
            {[
              { label: "Todos", value: "all", count: totalCount },
              { label: "Aguardando", value: "waiting", count: waitingCount },
              { label: "Chegaram", value: "arrived", count: arrivedCount },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex-1 py-2.5 text-[9px] font-black tracking-wider uppercase transition-all border ${
                  activeTab === tab.value
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-[8px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? "bg-white/20" : "bg-stone-100"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Lista de Pessoas */}
          <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
            <div className="bg-stone-900 px-6 py-5 flex items-center justify-between border-b-4 border-primary">
              <div>
                <h2 className="text-[11px] font-serif tracking-[0.25em] uppercase text-white">
                  <DoorOpen className="inline h-4 w-4 mr-2 opacity-70" />
                  Portaria · Check-In
                </h2>
                <p className="text-[8px] opacity-30 tracking-widest uppercase font-light mt-0.5">
                  {filteredPeople.length} pessoa{filteredPeople.length !== 1 ? "s" : ""} exibida{filteredPeople.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              {filteredPeople.length === 0 ? (
                <div className="py-16 text-center">
                  <Search className="h-8 w-8 text-stone-200 mx-auto mb-3" />
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest">
                    {search ? "Nenhum resultado encontrado" : "Nenhuma confirmação"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {filteredPeople.map((person, i) => {
                    const arrived = !!checkedIn[person.id];
                    return (
                      <button
                        key={person.id}
                        onClick={() => toggleCheckIn(person.id, person.name)}
                        className={`w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 text-left group ${
                          arrived
                            ? "bg-emerald-50/70 hover:bg-emerald-50"
                            : "hover:bg-stone-50"
                        }`}
                      >
                        {/* Número */}
                        <span className="text-[9px] opacity-20 font-bold w-5 text-center flex-shrink-0">
                          {i + 1}
                        </span>

                        {/* Ícone de status */}
                        <div className={`flex-shrink-0 transition-all duration-300 ${arrived ? "scale-110" : "group-hover:scale-105"}`}>
                          {arrived ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-stone-200 group-hover:text-stone-300" />
                          )}
                        </div>

                        {/* Nome */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold uppercase tracking-wider truncate transition-colors ${
                            arrived ? "text-emerald-700 line-through decoration-emerald-300 decoration-1" : "text-stone-700 group-hover:text-primary"
                          }`}>
                            {person.name}
                          </p>
                          {person.tipo === "FAMILIA" && (
                            <p className="text-[8px] text-stone-400 tracking-wider uppercase">
                              Família {person.groupName}
                            </p>
                          )}
                        </div>

                        {/* Badge de status */}
                        <span className={`flex-shrink-0 text-[7.5px] font-black tracking-widest uppercase px-2 py-1 transition-all ${
                          arrived
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                        }`}>
                          {arrived ? "CHEGOU" : "AGUARD."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral: Resumo + Presentes + Fraldas */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contagem Buffet */}
          <Card className="border-none shadow-xl bg-stone-50 rounded-none p-7 space-y-5 border border-primary/5">
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary border-b border-primary/10 pb-3">
              Contagem Buffet
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 shadow-sm text-center space-y-1">
                <p className="text-[8.5px] opacity-40 uppercase tracking-widest">Adultos</p>
                <p className="text-3xl font-serif text-primary">{totalAdults}</p>
              </div>
              <div className="bg-white p-5 shadow-sm text-center space-y-1">
                <p className="text-[8.5px] opacity-40 uppercase tracking-widest">Crianças</p>
                <p className="text-3xl font-serif text-primary">{totalChildren}</p>
              </div>
              <div className="col-span-2 bg-stone-900 text-white p-4 text-center">
                <p className="text-[11px] tracking-[0.4em] uppercase">
                  Total Geral: <span className="font-bold">{totalAdults + totalChildren}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Presentes */}
          <Card className="border-none shadow-xl bg-white rounded-none p-7 space-y-5">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary opacity-40" />
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Presentes Reservados</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {giftsReserved.map((r, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] tracking-widest p-3 bg-stone-50 border border-primary/5 uppercase">
                  <span className="font-bold opacity-70 truncate pr-2">{r.guest}</span>
                  <span className="text-primary font-bold flex-shrink-0">{r.gift}</span>
                </div>
              ))}
              {giftsReserved.length === 0 && (
                <p className="text-[9px] opacity-20 py-4 text-center">Nenhum presente na lista ainda</p>
              )}
            </div>
          </Card>

          {/* Fraldas */}
          <Card className="border-none shadow-xl bg-white rounded-none p-7 space-y-5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary opacity-40" />
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Fraldas Confirmadas</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {diapersList.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] tracking-widest p-3 bg-stone-50 border border-primary/5 uppercase">
                  <span className="font-bold opacity-70 truncate pr-2">{d.guest}</span>
                  <span className="bg-primary text-white px-2 py-0.5 font-bold">{d.size}</span>
                </div>
              ))}
              {diapersList.length === 0 && (
                <p className="text-[9px] opacity-20 py-4 text-center">Nenhuma fralda ainda</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
