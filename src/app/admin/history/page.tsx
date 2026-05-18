"use client";

import { useState, useEffect } from "react";
import { getHistoryLogs } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  MessageSquare,
  Baby,
  Clock
} from "lucide-react";

interface GroupedGuestLog {
  guestId: string;
  guestNome: string;
  latestLog: any;
  history: any[];
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsSyncing(true);

    try {
      const data = await getHistoryLogs();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      fetchHistory(true);
    }, 15000); // Atualiza silenciosamente a cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Agrupa os logs de GuestHistory por guestId
  const groupedLogsMap = logs.reduce((acc: Record<string, GroupedGuestLog>, log: any) => {
    if (!acc[log.guestId]) {
      acc[log.guestId] = {
        guestId: log.guestId,
        guestNome: log.guestNome,
        latestLog: log,
        history: []
      };
    } else {
      acc[log.guestId].history.push(log);
    }
    return acc;
  }, {});

  // Ordena os convidados pela data/hora da resposta mais recente
  const groupedList = Object.values(groupedLogsMap).sort((a, b) => {
    return new Date(b.latestLog.data_resposta).getTime() - new Date(a.latestLog.data_resposta).getTime();
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Cabeçalho */}
      <header className="flex justify-between items-end border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase flex items-center gap-3">
            <History className="h-8 w-8 text-primary" /> Histórico
          </h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">
            Linha do tempo de respostas e alterações
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => fetchHistory()} 
          disabled={loading || isSyncing}
          className="border border-primary/10 h-11 w-11 rounded-none bg-white hover:bg-stone-50"
        >
          <RefreshCw className={(loading || isSyncing) ? "animate-spin h-4 w-4" : "h-4 w-4"} />
        </Button>
      </header>

      {/* Conteúdo Principal */}
      {loading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary opacity-50" />
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-40">Carregando linha do tempo...</p>
        </div>
      ) : (
        <div className="relative max-w-3xl mx-auto py-6">
          {/* Linha vertical central da linha do tempo */}
          {groupedList.length > 0 && (
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-0.5 bg-primary/10 -translate-x-1/2" />
          )}

          <div className="space-y-12 relative">
            <AnimatePresence initial={false}>
              {groupedList.map((item, idx) => {
                const { latestLog, history } = item;
                const isConfirmed = latestLog.status_confirmacao === "CONFIRMED";
                const isLeftPosition = idx % 2 === 0;

                return (
                  <motion.div
                    key={item.guestId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
                    className={`flex flex-col lg:flex-row items-start ${
                      isLeftPosition ? "lg:flex-row" : "lg:flex-row-reverse"
                    } relative pl-12 lg:pl-0`}
                  >
                    {/* Marcador/Bolinha da Linha do Tempo centralizado */}
                    <div className="absolute left-6 lg:left-1/2 w-8 h-8 rounded-full border-4 border-stone-50 shadow-md flex items-center justify-center -translate-x-1/2 z-10 bg-white">
                      {isConfirmed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 fill-red-50" />
                      )}
                    </div>

                    {/* Espaço em branco no lado oposto para centralização em desktop */}
                    <div className="hidden lg:block w-1/2" />

                    {/* Cartão de Resposta */}
                    <div className="w-full lg:w-1/2 lg:px-8">
                      <Card className="border border-primary/5 shadow-xl hover:shadow-2xl rounded-none p-6 space-y-4 bg-white hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                        {/* Indicador de Resposta Recente */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isConfirmed ? "bg-emerald-500" : "bg-red-400"}`} />

                        {/* Cabeçalho do Card com Data Mais Recente */}
                        <div className="flex items-center justify-between text-stone-400 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 opacity-55" />
                            <span className="text-[8px] font-bold tracking-widest uppercase mt-0.5">
                              Última resposta:
                            </span>
                          </div>
                          <span className="text-[9px] font-bold tracking-wider text-stone-500">
                            {formatDate(latestLog.data_resposta)}
                          </span>
                        </div>

                        {/* Nome do Convidado e Status Atual */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold tracking-wider text-stone-800 uppercase leading-snug">
                            {item.guestNome}
                          </h4>
                          <div className="flex gap-2">
                            <Badge 
                              className={`rounded-none text-[8px] font-bold tracking-widest uppercase border-none px-2.5 py-0.5 ${
                                isConfirmed 
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" 
                                  : "bg-red-50 text-red-500 hover:bg-red-50"
                              }`}
                            >
                              {isConfirmed ? "Confirmado" : "Recusado"}
                            </Badge>
                          </div>
                        </div>

                        {/* Detalhes da Confirmação Atual */}
                        {isConfirmed && (
                          <div className="bg-stone-50 border border-primary/5 p-4 text-[10px] tracking-wide text-stone-600 space-y-2 rounded-none font-medium leading-relaxed">
                            <div className="flex justify-between">
                              <span className="opacity-60 uppercase text-[8px] font-bold tracking-wider">Acompanhantes:</span>
                              <span className="font-bold text-stone-800 uppercase">
                                {latestLog.qtd_adultos} {latestLog.qtd_adultos === 1 ? "Adulto" : "Adultos"} 
                                {latestLog.qtd_criancas > 0 && ` e ${latestLog.qtd_criancas} ${latestLog.qtd_criancas === 1 ? "Criança" : "Crianças"}`}
                              </span>
                            </div>
                            
                            {latestLog.fralda_tamanho && (
                              <div className="flex justify-between border-t border-stone-200/60 pt-2">
                                <span className="opacity-60 uppercase text-[8px] font-bold tracking-wider flex items-center gap-1">
                                  <Baby className="h-3.5 w-3.5 text-primary opacity-80" /> Fralda Escolhida:
                                </span>
                                <span className="font-bold text-primary uppercase">Tamanho {latestLog.fralda_tamanho}</span>
                              </div>
                            )}

                            {latestLog.kit_churrasco && (
                              <div className="flex justify-between border-t border-stone-200/60 pt-2">
                                <span className="opacity-60 uppercase text-[8px] font-bold tracking-wider">Kit Churrasco:</span>
                                <span className="font-bold text-amber-600 uppercase">Reservado</span>
                              </div>
                            )}

                            {latestLog.giftName && (
                              <div className="flex justify-between border-t border-stone-200/60 pt-2">
                                <span className="opacity-60 uppercase text-[8px] font-bold tracking-wider">Presente Reservado:</span>
                                <span className="font-bold text-stone-800 uppercase truncate max-w-[150px]">{latestLog.giftName}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recado do Mural Recente */}
                        {latestLog.mensagem && (
                          <div className="pt-3.5 border-t border-stone-100 flex items-start gap-2.5">
                            <MessageSquare className="h-3.5 w-3.5 text-primary opacity-50 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] opacity-75 italic text-stone-600 leading-relaxed normal-case">
                              "{latestLog.mensagem}"
                          </p>
                        </div>
                      )}

                      {/* Histórico de Alterações Anteriores */}
                      {history.length > 0 && (
                        <div className="pt-4 border-t border-stone-100 space-y-2.5 mt-4">
                          <p className="text-[8px] font-bold tracking-[0.2em] text-stone-400 uppercase flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 opacity-60" /> Alterações Anteriores:
                          </p>
                          <div className="space-y-2 pl-0.5">
                            {history.map((histLog: any) => {
                              const hConfirmed = histLog.status_confirmacao === "CONFIRMED";
                              return (
                                <div key={histLog.id} className="flex items-center justify-between text-[9px] text-stone-500 font-medium bg-stone-50/50 p-2 border border-stone-100">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${hConfirmed ? "bg-emerald-500" : "bg-red-400"}`} />
                                    <span className="font-bold uppercase tracking-wider">
                                      {hConfirmed ? "Confirmou" : "Recusou"}
                                    </span>
                                  </div>
                                  <span className="text-stone-400 text-[8px] font-bold">
                                    {formatDate(histLog.data_resposta)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Caso não haja nenhuma resposta ainda */}
      {!loading && logs.length === 0 && (
        <Card className="max-w-md mx-auto p-12 text-center border border-primary/5 bg-white shadow-xl space-y-4 rounded-none">
          <History className="h-12 w-12 text-stone-300 mx-auto" />
          <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-500">Nenhuma Resposta Registrada</h3>
          <p className="text-[10px] opacity-40 leading-relaxed max-w-xs mx-auto">
            Assim que seus convidados começarem a responder aos convites em tempo real, as respostas e histórico de alterações aparecerão aqui.
          </p>
        </Card>
      )}
    </div>
  );
}
