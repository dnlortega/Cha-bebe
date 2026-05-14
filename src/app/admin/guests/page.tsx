"use client";

import { useState, useEffect } from "react";
import { 
  getGuests, 
  deleteGuest, 
  updateGuest,
} from "@/app/actions";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  Save,
  PackageCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit state
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
    const interval = setInterval(fetchGuests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("TEM CERTEZA QUE DESEJA EXCLUIR ESTE CONVIDADO?")) return;
    const result = await deleteGuest(id);
    if (result.success) {
      toast.success("CONVIDADO EXCLUÍDO");
      fetchGuests();
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editingGuest) return;
    setIsEditing(true);
    const result = await updateGuest(editingGuest.id, editName, editType, editMembers, editAdults, editChildren, editDiaper, editKitChurrasco);
    if (result.success) {
      toast.success("DADOS ATUALIZADOS");
      setEditingGuest(null);
      fetchGuests();
    } else {
      toast.error(result.error);
    }
    setIsEditing(false);
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("LINK COPIADO!");
  };

  const filteredGuests = guests.filter(g => 
    g.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">CONVITES</h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] font-light uppercase">GERENCIE SUA LISTA DE CONVIDADOS</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
              <Input 
                placeholder="BUSCAR POR NOME OU LINK..." 
                className="pl-12 bg-white border-primary/10 rounded-none h-12 text-[10px] tracking-widest focus-visible:ring-primary/20 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Tooltip>
             <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => fetchGuests()} disabled={loading} className="w-14 h-12 border-primary/20 rounded-none bg-white shadow-sm hover:bg-stone-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                </Button>
             </TooltipTrigger>
             <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR</TooltipContent>
           </Tooltip>
        </div>
      </header>

      <div className="bg-white border border-primary/5 shadow-xl overflow-hidden rounded-none">
        {/* Mobile View: Cards */}
        <div className="block lg:hidden divide-y divide-primary/5">
          {filteredGuests.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <Search className="h-12 w-12 opacity-10 mx-auto" />
              <p className="text-[10px] opacity-40 tracking-widest uppercase">Nenhum convidado encontrado</p>
            </div>
          ) : filteredGuests.map((guest) => (
            <div key={guest.id} className="p-6 space-y-6 hover:bg-stone-50/50 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                  <div className="text-[12px] font-bold tracking-widest text-primary uppercase">{guest.nome}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] opacity-40 font-mono lowercase tracking-tight">/{guest.slug}</span>
                    <button onClick={() => copyToClipboard(guest.slug)} className="p-1 hover:bg-primary/5 transition-colors">
                        <Copy className="h-3 w-3 opacity-30" />
                    </button>
                  </div>
                </div>
                <Badge variant="outline" className={`rounded-none text-[8px] py-1 px-3 border-primary/10 font-bold tracking-widest ${guest.tipo === 'FAMILIA' ? 'bg-primary/5 text-primary' : 'bg-stone-50 text-stone-500'}`}>
                  {guest.tipo}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-stone-50/50 p-4 border border-primary/5">
                 <div className="space-y-1">
                    <p className="text-[8px] opacity-30 font-bold tracking-widest uppercase">STATUS</p>
                    {guest.status_confirmacao === "CONFIRMED" ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                         <CheckCircle className="h-3 w-3" />
                         <span className="text-[9px] font-bold tracking-widest">OK</span>
                      </div>
                    ) : guest.status_confirmacao === "DECLINED" ? (
                      <div className="flex items-center gap-1.5 text-red-400">
                         <XCircle className="h-3 w-3" />
                         <span className="text-[9px] font-bold tracking-widest uppercase">OFF</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 opacity-30 italic">
                         <Clock className="h-3 w-3" />
                         <span className="text-[9px] tracking-widest">...</span>
                      </div>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] opacity-30 font-bold tracking-widest uppercase">PRESENÇA</p>
                    <p className="text-[10px] font-bold text-primary/70 uppercase">
                       {guest.status_confirmacao === "CONFIRMED" ? `${(guest.qtd_adultos || 0) + (guest.qtd_criancas || 0)} P` : "-"}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] opacity-30 font-bold tracking-widest uppercase">FRALDA</p>
                    <p className="text-[10px] font-bold text-primary/70 uppercase">
                       {guest.fralda_tamanho || "-"}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] opacity-30 font-bold tracking-widest uppercase">KIT CHURRASCO</p>
                    <p className="text-[10px] font-bold text-primary/70 uppercase">
                       {guest.kit_churrasco ? "SIM" : "-"}
                    </p>
                 </div>
              </div>

              <div className="flex justify-end items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-10 h-10 rounded-none border-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                  onClick={() => window.open(`/${guest.slug}`, '_blank')}
                  title="VER PÁGINA"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-10 h-10 rounded-none border-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                  onClick={() => {
                    setEditingGuest(guest);
                    setEditName(guest.nome);
                    setEditType(guest.tipo);
                    setEditMembers(guest.membros || "");
                    setEditAdults(guest.qtd_adultos || 1);
                    setEditChildren(guest.qtd_criancas || 0);
                    setEditDiaper(guest.fralda_tamanho || null);
                    setEditKitChurrasco(guest.kit_churrasco || false);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-10 h-10 rounded-none border-primary/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  onClick={() => handleDelete(guest.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {guest.membros_confirmados && (
                <div className="text-[9px] opacity-60 normal-case leading-relaxed bg-stone-50 p-4 border-l-4 border-primary/20 italic">
                  &quot;{guest.membros_confirmados}&quot;
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50 border-b border-primary/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary pl-8 uppercase">CONVIDADO</TableHead>
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary uppercase">TIPO</TableHead>
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary uppercase">FRALDA</TableHead>
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary uppercase">KIT</TableHead>
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary uppercase">STATUS</TableHead>
                <TableHead className="text-[10px] tracking-[0.3em] h-20 font-bold text-primary uppercase">QUEM VAI / DETALHES</TableHead>
                <TableHead className="text-right text-[10px] tracking-[0.3em] h-20 font-bold text-primary pr-8 uppercase">OPÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Search className="h-12 w-12 opacity-5" />
                      <p className="text-[10px] opacity-30 tracking-[0.4em] uppercase">Nenhum convidado encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredGuests.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-stone-50/50 border-primary/5 transition-colors group">
                  <TableCell className="py-8 pl-8">
                    <div className="space-y-1.5">
                      <div className="text-[12px] font-bold tracking-widest text-primary uppercase">{guest.nome}</div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] opacity-40 font-mono lowercase tracking-tight">/{guest.slug}</span>
                         <button 
                            onClick={() => copyToClipboard(guest.slug)} 
                            className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-primary/5"
                          >
                            <Copy className="h-3 w-3 opacity-30 hover:opacity-100" />
                         </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-none text-[9px] py-1 px-4 border-primary/10 font-bold tracking-widest ${guest.tipo === 'FAMILIA' ? 'bg-primary/5 text-primary' : 'bg-stone-50 text-stone-500'}`}>
                      {guest.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.fralda_tamanho ? (
                      <div className="flex items-center gap-2 opacity-60">
                        <PackageCheck className="h-4 w-4" />
                        <span className="text-[11px] font-bold tracking-widest">{guest.fralda_tamanho}</span>
                      </div>
                    ) : (
                      <span className="opacity-20">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.kit_churrasco ? (
                      <Badge variant="outline" className="rounded-none text-[8px] py-1 px-2 border-primary/20 bg-stone-900 text-white font-bold tracking-widest uppercase">KIT CHURRASCO</Badge>
                    ) : (
                      <span className="opacity-20">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.status_confirmacao === "CONFIRMED" ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                         <CheckCircle className="h-4 w-4" />
                         <span className="text-[10px] font-bold tracking-[0.2em] uppercase">CONFIRMADO</span>
                      </div>
                    ) : guest.status_confirmacao === "DECLINED" ? (
                      <div className="flex items-center gap-2 text-red-400">
                         <XCircle className="h-4 w-4" />
                         <span className="text-[10px] font-bold tracking-[0.2em] uppercase">NÃO VIRÁ</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-20 italic">
                         <Clock className="h-4 w-4" />
                         <span className="text-[10px] tracking-[0.2em] uppercase">PENDENTE</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.status_confirmacao === "CONFIRMED" ? (
                      <div className="space-y-3 py-2">
                        <div className="flex gap-4">
                           <div className="text-[10px] tracking-widest uppercase">
                              <span className="opacity-40 mr-2">ADULTOS:</span>
                              <span className="font-bold">{guest.qtd_adultos || 0}</span>
                           </div>
                           <div className="text-[10px] tracking-widest uppercase">
                              <span className="opacity-40 mr-2">CRIANÇAS:</span>
                              <span className="font-bold">{guest.qtd_criancas || 0}</span>
                           </div>
                        </div>
                        {guest.membros_confirmados && (
                          <div className="text-[9px] opacity-50 normal-case leading-relaxed max-w-[300px] bg-stone-100 p-3 border-l-4 border-primary/20 italic">
                            &quot;{guest.membros_confirmados}&quot;
                          </div>
                        )}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 opacity-30 hover:opacity-100 hover:bg-primary/5" onClick={() => window.open(`/${guest.slug}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] tracking-widest uppercase">VER PÁGINA</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 opacity-30 hover:opacity-100 hover:bg-primary/5 text-primary"
                            onClick={() => {
                              setEditingGuest(guest);
                              setEditName(guest.nome);
                              setEditType(guest.tipo);
                              setEditMembers(guest.membros || "");
                              setEditAdults(guest.qtd_adultos || 1);
                              setEditChildren(guest.qtd_criancas || 0);
                              setEditDiaper(guest.fralda_tamanho || null);
                              setEditKitChurrasco(guest.kit_churrasco || false);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] tracking-widest uppercase">EDITAR</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 opacity-30 hover:opacity-100 hover:bg-red-50 text-red-500"
                            onClick={() => handleDelete(guest.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] tracking-widest uppercase">EXCLUIR</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
        <DialogContent className="rounded-none border-none sm:max-w-[600px] uppercase tracking-widest p-0 overflow-hidden shadow-2xl">
          <div className="bg-primary p-10 text-primary-foreground flex justify-between items-center">
             <div className="space-y-1">
                <DialogTitle className="text-2xl font-serif tracking-[0.2em]">EDITAR</DialogTitle>
                <p className="text-[10px] opacity-60 tracking-[0.4em] uppercase font-light">ATUALIZAR INFORMAÇÕES DO CONVITE</p>
             </div>
             <Tooltip>
               <TooltipTrigger asChild>
                  <Button 
                    onClick={handleUpdate} 
                    disabled={isEditing || !editName.trim()}
                    size="icon"
                    className="bg-white text-primary hover:bg-stone-100 h-16 w-16 rounded-none shadow-2xl transition-all"
                  >
                    {isEditing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  </Button>
               </TooltipTrigger>
               <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR ALTERAÇÕES</TooltipContent>
             </Tooltip>
          </div>
          <div className="p-10 space-y-10 bg-white">
            <div className="space-y-4">
              <label className="text-[10px] font-bold opacity-40 tracking-widest">NOME DO CONVITE</label>
              <Input 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50 text-[11px]"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-bold opacity-40 tracking-widest">CATEGORIA</label>
                 <Select value={editType} onValueChange={(val) => val && setEditType(val)}>
                   <SelectTrigger className="rounded-none border-primary/10 h-14 tracking-[0.2em] bg-stone-50 text-[11px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                     <SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem>
                     <SelectItem value="FAMILIA">FAMÍLIA</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">Tamanho da Fralda</label>
                  <Select value={editDiaper || "NONE"} onValueChange={(val) => setEditDiaper(val === "NONE" ? null : val)}>
                    <SelectTrigger className="rounded-none border-primary/10 h-14 tracking-[0.2em] bg-stone-50 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                      <SelectItem value="NONE">NENHUMA</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="P">P</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="GG">GG</SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-40 tracking-widest">ADULTOS</label>
                    <Input 
                      type="number"
                      value={editAdults}
                      onChange={(e) => setEditAdults(parseInt(e.target.value) || 0)}
                      className="rounded-none border-primary/10 focus-visible:ring-primary/20 h-14 bg-stone-50 text-[11px]"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-40 tracking-widest">CRIANÇAS</label>
                    <Input 
                      type="number"
                      value={editChildren}
                      onChange={(e) => setEditChildren(parseInt(e.target.value) || 0)}
                      className="rounded-none border-primary/10 focus-visible:ring-primary/20 h-14 bg-stone-50 text-[11px]"
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-bold opacity-40 tracking-widest uppercase">Kit Churrasco</label>
                  <Select value={editKitChurrasco ? "SIM" : "NAO"} onValueChange={(val) => setEditKitChurrasco(val === "SIM")}>
                    <SelectTrigger className="rounded-none border-primary/10 h-14 tracking-[0.2em] bg-stone-50 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NÃO</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            {editType === "FAMILIA" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-bold opacity-40 tracking-widest">NOMES DOS INTEGRANTES</label>
                <Textarea 
                  value={editMembers}
                  onChange={(e) => setEditMembers(e.target.value)}
                  placeholder="EX: JOÃO, MARIA, PEDRO"
                  className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest min-h-[140px] bg-stone-50 p-6 text-[11px] leading-relaxed"
                />
                <p className="text-[9px] opacity-30 italic">NOMES SEPARADOS POR VÍRGULA.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
