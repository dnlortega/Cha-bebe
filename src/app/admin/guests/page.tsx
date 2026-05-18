"use client";

import { useState, useEffect, useMemo } from "react";
import { getGuests, deleteGuest, updateGuest, deleteAllGuests } from "@/app/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, CheckCircle, XCircle, Clock, Trash2, Edit2,
  Copy, ExternalLink, Search, RefreshCw, Save, PackageCheck,
  Download, SortAsc, SortDesc, MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortField = "nome" | "status" | "tipo";
type SortDir = "asc" | "desc";
type StatusFilter = "ALL" | "CONFIRMED" | "DECLINED" | "PENDING";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("INDIVIDUAL");
  const [editMembers, setEditMembers] = useState("");
  const [editAdults, setEditAdults] = useState(1);
  const [editChildren, setEditChildren] = useState(0);
  const [editDiaper, setEditDiaper] = useState<string | null>(null);
  const [editKitChurrasco, setEditKitChurrasco] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("EXCLUIR CONVIDADO?")) return;
    const result = await deleteGuest(id);
    if (result.success) fetchGuests();
  };

  const handleDeleteAll = async () => {
    const doubleCheck = confirm("ATENÇÃO: VOCÊ TEM CERTEZA QUE DESEJA EXCLUIR TODOS OS CONVIDADOS DA LISTA? ESTA AÇÃO NÃO PODE SER DESFEITA!");
    if (!doubleCheck) return;
    
    setLoading(true);
    const result = await deleteAllGuests();
    if (result.success) {
      toast.success("TODOS OS CONVIDADOS FORAM EXCLUÍDOS!");
      fetchGuests();
    } else {
      toast.error("ERRO AO EXCLUIR TODOS OS CONVIDADOS.");
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editingGuest) return;
    setIsEditing(true);
    const result = await updateGuest(editingGuest.id, editName, editType, editMembers, editAdults, editChildren, editDiaper || undefined, editKitChurrasco);
    if (result.success) { setEditingGuest(null); fetchGuests(); }
    setIsEditing(false);
  };

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast.success("LINK COPIADO!");
  };

  const sendWhatsApp = (guest: any) => {
    const link = `${window.location.origin}/${guest.slug}`;
    const text = `Olá ${guest.nome}! Gostaríamos de te convidar para o nosso Chá de Bebê. Confirme sua presença aqui: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const exportCSV = () => {
    const headers = ["Nome", "Status", "Adultos", "Crianças", "Fralda", "Kit", "Mensagem", "Link"];
    const rows = filteredGuests.map(g => [g.nome, g.status_confirmacao || "PENDENTE", g.qtd_adultos, g.qtd_criancas, g.fralda_tamanho || "", g.kit_churrasco ? "SIM" : "NÃO", (g.mensagem || "").replace(/;/g, ","), `${window.location.origin}/${g.slug}`]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "convidados.csv"; a.click();
  };

  const filteredGuests = useMemo(() => {
    return guests
      .filter(g => {
        const matchSearch = g.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "ALL" || (statusFilter === "PENDING" ? !g.status_confirmacao : g.status_confirmacao === statusFilter);
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let va = a[sortField === "status" ? "status_confirmacao" : sortField] || "";
        let vb = b[sortField === "status" ? "status_confirmacao" : sortField] || "";
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [guests, searchTerm, statusFilter, sortField, sortDir]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">CONVITES</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">{filteredGuests.length} Convidados Filtrados</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-20" />
            <Input placeholder="Buscar..." className="pl-9 bg-white border-primary/10 rounded-none h-10 text-[10px] tracking-widest uppercase" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="rounded-none border-primary/10 h-10 bg-white text-[10px] tracking-widest w-32"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-none text-[10px] tracking-widest">
              <SelectItem value="ALL">TODOS</SelectItem>
              <SelectItem value="CONFIRMED">CONFIRMADOS</SelectItem>
              <SelectItem value="PENDING">PENDENTES</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportCSV} className="h-10 w-10 rounded-none border-primary/10 bg-white"><Download className="h-4 w-4 text-primary" /></Button>
          <Button variant="outline" size="icon" onClick={fetchGuests} disabled={loading} className="h-10 w-10 rounded-none border-primary/10 bg-white"><RefreshCw className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} /></Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDeleteAll} 
                disabled={loading || guests.length === 0} 
                className="h-10 w-10 rounded-none border-red-200 hover:bg-red-50 hover:border-red-300 bg-white text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[9px]">EXCLUIR TODOS</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="bg-white border border-primary/5 shadow-xl overflow-hidden rounded-none">
        <Table>
          <TableHeader className="bg-stone-50/80">
            <TableRow>
              <TableHead className="h-14 pl-8 text-[9px] tracking-widest uppercase font-bold text-primary">Convidado</TableHead>
              <TableHead className="h-14 text-[9px] tracking-widest uppercase font-bold text-primary">Status</TableHead>
              <TableHead className="h-14 text-[9px] tracking-widest uppercase font-bold text-primary">Presente</TableHead>
              <TableHead className="h-14 text-right pr-8 text-[9px] tracking-widest uppercase font-bold text-primary">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map(guest => (
              <TableRow key={guest.id} className="hover:bg-stone-50/40 border-primary/5 group">
                <TableCell className="py-5 pl-8">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold tracking-widest text-primary uppercase">{guest.nome}</p>
                    <p className="text-[9px] opacity-30 font-mono lowercase">/{guest.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {guest.status_confirmacao === "CONFIRMED" ? <Badge className="bg-emerald-500 rounded-none text-[8px] tracking-widest">CONFIRMADO</Badge> : <Badge variant="outline" className="opacity-30 rounded-none text-[8px] tracking-widest">PENDENTE</Badge>}
                </TableCell>
                <TableCell>
                  <div className="text-[10px] tracking-widest uppercase opacity-60">
                    {guest.gift?.name ? <span className="text-emerald-600 font-bold">{guest.gift.name}</span> : <span>{guest.fralda_tamanho || "—"}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-emerald-500" onClick={() => sendWhatsApp(guest)}><MessageCircle className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent className="text-[9px]">WhatsApp</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => copyToClipboard(guest.slug)}><Copy className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent className="text-[9px]">Copiar Link</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setEditingGuest(guest); setEditName(guest.nome); setEditType(guest.tipo); setEditMembers(guest.membros || ""); setEditAdults(guest.qtd_adultos || 1); setEditChildren(guest.qtd_criancas || 0); setEditDiaper(guest.fralda_tamanho || null); setEditKitChurrasco(guest.kit_churrasco || false); }}><Edit2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent className="text-[9px]">Editar</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-red-400" onClick={() => handleDelete(guest.id)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent className="text-[9px]">Excluir</TooltipContent></Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingGuest} onOpenChange={o => !o && setEditingGuest(null)}>
        <DialogContent className="rounded-none border-none sm:max-w-[500px] p-0 overflow-hidden shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground flex justify-between items-center">
            <DialogTitle className="text-xl font-serif tracking-[0.2em] uppercase">Editar</DialogTitle>
            <Button onClick={handleUpdate} disabled={isEditing} size="icon" className="bg-white text-primary h-14 w-14 rounded-none"><Save className="h-5 w-5" /></Button>
          </div>
          <div className="p-8 space-y-4 bg-white">
            <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none h-12 bg-stone-50 text-[11px] tracking-widest uppercase" placeholder="NOME" />
            <div className="grid grid-cols-2 gap-4">
              <Select value={editType} onValueChange={(v) => v && setEditType(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem><SelectItem value="FAMILIA">FAMÍLIA</SelectItem></SelectContent></Select>
              <Select value={editDiaper || "NONE"} onValueChange={(v) => setEditDiaper(v === "NONE" ? null : v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">FRALDA: NENHUMA</SelectItem>{["RN","P","M","G","GG"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            {editType === "FAMILIA" && <Textarea value={editMembers} onChange={e => setEditMembers(e.target.value)} placeholder="MEMBROS (VÍRGULA)" className="h-24 rounded-none bg-stone-50" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
