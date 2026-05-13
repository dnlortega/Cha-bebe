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
  Save
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
    const result = await updateGuest(editingGuest.id, editName, editType, editMembers);
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">CONVITES</h1>
          <p className="text-[10px] opacity-50 tracking-[0.3em] font-light">LISTA COMPLETA DE CONVIDADOS</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30" />
              <Input 
                placeholder="BUSCAR CONVIDADO..." 
                className="pl-9 bg-white border-primary/10 rounded-none h-10 text-[9px] tracking-widest focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Tooltip>
             <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => fetchGuests()} disabled={loading} className="w-12 h-10 border-primary/20 rounded-none bg-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
             </TooltipTrigger>
             <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR</TooltipContent>
           </Tooltip>
        </div>
      </header>

      <div className="bg-white border border-primary/5 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-primary/5">
          {filteredGuests.map((guest) => (
            <div key={guest.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold tracking-widest">{guest.nome}</div>
                  <div className="text-[9px] opacity-40 font-mono lowercase tracking-tight">/{guest.slug}</div>
                </div>
                <Badge variant="outline" className={`rounded-none text-[8px] py-0.5 px-3 border-primary/20 font-light ${guest.tipo === 'FAMILIA' ? 'bg-primary/5' : ''}`}>
                  {guest.tipo}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  {guest.status_confirmacao === "CONFIRMED" ? (
                    <div className="flex items-center gap-1.5 text-primary">
                       <CheckCircle className="h-3 w-3" />
                       <span className="text-[9px] font-bold">CONFIRMADO</span>
                    </div>
                  ) : guest.status_confirmacao === "DECLINED" ? (
                    <div className="flex items-center gap-1.5 opacity-30">
                       <XCircle className="h-3 w-3" />
                       <span className="text-[9px]">NÃO VIRÁ</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 opacity-20 italic">
                       <Clock className="h-3 w-3" />
                       <span className="text-[9px]">AGUARDANDO...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40" onClick={() => copyToClipboard(guest.slug)}>
                      <Copy className="h-3 w-3" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40" onClick={() => window.open(`/${guest.slug}`, '_blank')}>
                      <ExternalLink className="h-3 w-3" />
                   </Button>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-none border-primary/10 uppercase tracking-widest text-[9px] min-w-[140px]">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingGuest(guest);
                            setEditName(guest.nome);
                            setEditType(guest.tipo);
                            setEditMembers(guest.membros || "");
                          }}
                          className="cursor-pointer py-3"
                        >
                          <Edit2 className="mr-3 h-3 w-3" /> EDITAR
                        </DropdownMenuItem>
                        <Separator className="bg-primary/5" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(guest.id)}
                          className="cursor-pointer text-red-500 py-3"
                        >
                          <Trash2 className="mr-3 h-3 w-3" /> EXCLUIR
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>

              {guest.membros_confirmados && (
                <div className="text-[8px] opacity-50 normal-case leading-relaxed bg-stone-50 p-2 border-l-2 border-primary/20">
                  {guest.membros_confirmados}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-[800px] sm:w-full">
            <TableHeader className="bg-stone-50">
              <TableRow className="hover:bg-transparent border-primary/5">
                <TableHead className="text-[10px] tracking-[0.2em] h-16 font-bold text-primary">CONVIDADO / LINK</TableHead>
                <TableHead className="text-[10px] tracking-[0.2em] h-16 font-bold text-primary">CATEGORIA</TableHead>
                <TableHead className="text-[10px] tracking-[0.2em] h-16 font-bold text-primary">STATUS / QUEM VAI</TableHead>
                <TableHead className="text-right text-[10px] tracking-[0.2em] h-16 font-bold text-primary">OPÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-stone-50/50 border-primary/5 group">
                  <TableCell className="py-6">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold tracking-widest">{guest.nome}</div>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] opacity-40 font-mono lowercase tracking-tight">/{guest.slug}</span>
                         <button onClick={() => copyToClipboard(guest.slug)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="h-3 w-3 opacity-30 hover:opacity-100" />
                         </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-none text-[8px] py-0.5 px-3 border-primary/20 font-light ${guest.tipo === 'FAMILIA' ? 'bg-primary/5' : ''}`}>
                      {guest.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.status_confirmacao === "CONFIRMED" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-primary">
                           <CheckCircle className="h-3 w-3" />
                           <span className="text-[9px] font-bold">CONFIRMADO</span>
                        </div>
                        {guest.membros_confirmados && (
                          <div className="text-[8px] opacity-50 normal-case leading-relaxed max-w-[200px] bg-stone-100 p-2 border-l-2 border-primary/20">
                            {guest.membros_confirmados}
                          </div>
                        )}
                      </div>
                    ) : guest.status_confirmacao === "DECLINED" ? (
                      <div className="flex items-center gap-1.5 opacity-30">
                         <XCircle className="h-3 w-3" />
                         <span className="text-[9px]">NÃO VIRÁ</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 opacity-20 italic">
                         <Clock className="h-3 w-3" />
                         <span className="text-[9px]">AGUARDANDO...</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" onClick={() => window.open(`/${guest.slug}`, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] tracking-widest uppercase">VER PÁGINA</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-40 hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-primary/10 uppercase tracking-widest text-[9px] min-w-[140px]">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingGuest(guest);
                              setEditName(guest.nome);
                              setEditType(guest.tipo);
                              setEditMembers(guest.membros || "");
                            }}
                            className="cursor-pointer py-3"
                          >
                            <Edit2 className="mr-3 h-3 w-3" /> EDITAR DADOS
                          </DropdownMenuItem>
                          <Separator className="bg-primary/5" />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(guest.id)}
                            className="cursor-pointer text-red-500 focus:text-red-500 py-3"
                          >
                            <Trash2 className="mr-3 h-3 w-3" /> EXCLUIR REGISTRO
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <DialogContent className="rounded-none border-none sm:max-w-[500px] uppercase tracking-widest p-0 overflow-hidden shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground flex justify-between items-center">
             <div className="space-y-1">
                <DialogTitle className="text-xl font-serif tracking-[0.2em]">EDITAR</DialogTitle>
                <p className="text-[9px] opacity-60 tracking-widest uppercase">ATUALIZAR CONVIDADO</p>
             </div>
             <Tooltip>
               <TooltipTrigger asChild>
                  <Button 
                    onClick={handleUpdate} 
                    disabled={isEditing || !editName.trim()}
                    size="icon"
                    className="bg-white text-primary hover:bg-stone-100 h-12 w-12 rounded-none"
                  >
                    {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
               </TooltipTrigger>
               <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR</TooltipContent>
             </Tooltip>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-[9px] font-bold opacity-40">NOME DO CONVITE</label>
              <Input 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold opacity-40">CATEGORIA</label>
              <Select value={editType} onValueChange={(val) => val && setEditType(val)}>
                <SelectTrigger className="rounded-none border-primary/10 h-12 tracking-[0.2em]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                  <SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem>
                  <SelectItem value="FAMILIA">FAMÍLIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editType === "FAMILIA" && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <label className="text-[9px] font-bold opacity-40">INTEGRANTES</label>
                <Textarea 
                  value={editMembers}
                  onChange={(e) => setEditMembers(e.target.value)}
                  placeholder="EX: JOÃO, MARIA, PEDRO"
                  className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest min-h-[120px] bg-stone-50"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
