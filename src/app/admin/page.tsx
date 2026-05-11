"use client";

import { useState, useEffect } from "react";
import { 
  getGuests, 
  verifyAdmin, 
  addMultipleGuests, 
  deleteGuest, 
  updateGuest,
  getSettings,
  updateSettings
} from "@/app/actions";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Settings as SettingsIcon,
  Users,
  Copy,
  ExternalLink,
  Search,
  ClipboardList,
  UserCheck,
  RefreshCw,
  Save,
  Check
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGuestsText, setNewGuestsText] = useState("");
  const [registering, setRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Settings state
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [savingSettings, setSavingSettings] = useState(false);

  // Edit state
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("INDIVIDUAL");
  const [editMembers, setEditMembers] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authorized) {
      fetchGuests();
      fetchSettings();
    }
  }, [authorized]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = await verifyAdmin(password);
    if (isCorrect) {
      setAuthorized(true);
    } else {
      toast.error("SENHA INCORRETA");
    }
  };

  const fetchGuests = async () => {
    setLoading(true);
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const data = await getSettings();
    setInvitationUrl(data.invitationUrl);
    setTheme(data.theme);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const result = await updateSettings(invitationUrl, theme);
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error(result.error);
    }
    setSavingSettings(false);
  };

  const handleAddGuests = async () => {
    if (!newGuestsText.trim()) return;
    setRegistering(true);
    const result = await addMultipleGuests(newGuestsText);
    if (result.success) {
      toast.success(`${result.count} CONVIDADOS CADASTRADOS!`);
      setNewGuestsText("");
      fetchGuests();
    } else {
      toast.error(result.error);
    }
    setRegistering(false);
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

  const copyFullGuestList = () => {
    const confirmedPeople = getConfirmedPeopleList();
    if (confirmedPeople.length === 0) {
      toast.error("NENHUM CONVIDADO CONFIRMADO AINDA.");
      return;
    }
    const text = confirmedPeople.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("LISTA DE NOMES COPIADA!");
  };

  const getConfirmedPeopleList = () => {
    const list: string[] = [];
    guests.forEach(g => {
      if (g.status_confirmacao === "CONFIRMED") {
        if (g.tipo === "FAMILIA" && g.membros_confirmados) {
          g.membros_confirmados.split(",").map((n: string) => n.trim()).forEach((n: string) => {
            if (n) list.push(`${n} (FAMÍLIA ${g.nome})`);
          });
        } else {
          list.push(g.nome);
        }
      }
    });
    return list.sort();
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm border-none shadow-2xl bg-secondary/50 rounded-none animate-in fade-in zoom-in duration-700">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-xl font-serif tracking-[0.3em] text-primary">ADMINISTRAÇÃO</CardTitle>
            <Separator className="w-8 mx-auto bg-primary/20" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input 
                type="password" 
                placeholder="SENHA DE ACESSO" 
                className="bg-transparent border-primary/10 rounded-none focus-visible:ring-primary/20 text-xs tracking-widest text-center h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-[10px] tracking-[0.3em] rounded-none transition-all">
                ENTRAR
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredGuests = guests.filter(g => 
    g.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmedPeopleList = getConfirmedPeopleList();

  const stats = {
    total: guests.length,
    confirmedGroups: guests.filter(g => g.status_confirmacao === "CONFIRMED").length,
    totalPeople: confirmedPeopleList.length,
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-12 font-inter selection:bg-accent selection:text-accent-foreground uppercase tracking-widest">
      <div className="max-w-7xl mx-auto space-y-8 sm:y-12">
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif text-primary tracking-[0.2em] sm:tracking-[0.3em]">PAINEL ADMIN</h1>
            <p className="text-[8px] sm:text-[10px] opacity-50 tracking-[0.3em] sm:tracking-[0.5em] font-light">GESTÃO DE EVENTO E CONVIDADOS</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
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
               <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR DADOS</TooltipContent>
             </Tooltip>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="rounded-none border-none shadow-sm bg-white p-4 sm:p-8 space-y-1 sm:y-2">
            <p className="text-[8px] sm:text-[10px] opacity-40 font-bold tracking-[0.2em]">CONVITES</p>
            <p className="text-xl sm:text-4xl font-serif text-primary">{stats.total}</p>
          </Card>
          <Card className="rounded-none border-none shadow-sm bg-white p-4 sm:p-8 space-y-1 sm:y-2">
            <p className="text-[8px] sm:text-[10px] text-green-600/60 font-bold tracking-[0.2em]">GRUPOS CONFIRMADOS</p>
            <p className="text-xl sm:text-4xl font-serif text-primary">{stats.confirmedGroups}</p>
          </Card>
          <Card className="rounded-none border-none shadow-sm bg-white p-4 sm:p-8 space-y-1 sm:y-2 col-span-2 md:col-span-1">
            <p className="text-[8px] sm:text-[10px] text-blue-600/60 font-bold tracking-[0.2em]">PESSOAS CONFIRMADAS</p>
            <p className="text-xl sm:text-4xl font-serif text-primary">{stats.totalPeople}</p>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-8">
          <TabsList className="bg-transparent border-b border-primary/10 w-full justify-start rounded-none h-auto p-0 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
            <TabsTrigger value="list" className="rounded-none bg-transparent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none whitespace-nowrap">CONVITES</TabsTrigger>
            <TabsTrigger value="final" className="rounded-none bg-transparent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none whitespace-nowrap">LISTA FINAL</TabsTrigger>
            <TabsTrigger value="add" className="rounded-none bg-transparent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none whitespace-nowrap">CADASTRAR</TabsTrigger>
            <TabsTrigger value="config" className="rounded-none bg-transparent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none whitespace-nowrap">VISUAL</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="animate-in fade-in duration-500">
            <div className="bg-white border border-primary/5 overflow-x-auto shadow-sm">
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
                            <TooltipContent className="text-[9px] tracking-widest uppercase rounded-none bg-primary text-white border-none">VER PÁGINA</TooltipContent>
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
          </TabsContent>

          <TabsContent value="final" className="animate-in fade-in duration-500">
             <Card className="border-none shadow-sm bg-white rounded-none max-w-2xl mx-auto overflow-hidden">
                <div className="bg-stone-900 p-8 sm:p-12 text-white flex justify-between items-center">
                   <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-serif tracking-widest flex items-center gap-3">
                         <UserCheck className="h-5 w-5 text-green-400" />
                         PRESENÇA
                      </h2>
                      <p className="text-[8px] sm:text-[9px] opacity-60 tracking-widest font-light uppercase">CONFIRMAÇÕES INDIVIDUAIS</p>
                   </div>
                   
                   <Tooltip>
                     <TooltipTrigger asChild>
                        <Button onClick={copyFullGuestList} variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10 rounded-none h-12 w-12">
                           <Copy className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent className="text-[10px] tracking-widest uppercase">COPIAR NOMES</TooltipContent>
                   </Tooltip>
                </div>
                <CardContent className="p-8 sm:p-12">
                   {confirmedPeopleList.length > 0 ? (
                      <div className="space-y-2">
                         {confirmedPeopleList.map((name, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-primary/5 last:border-0 group">
                               <span className="text-[10px] opacity-20 font-serif w-6">{i + 1}.</span>
                               <span className="text-[11px] tracking-[0.1em] font-medium group-hover:text-primary transition-colors">{name}</span>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-center py-20 space-y-4">
                         <ClipboardList className="h-12 w-12 mx-auto opacity-10" />
                         <p className="text-[10px] opacity-30 tracking-[0.3em]">AINDA NÃO HÁ CONFIRMAÇÕES</p>
                      </div>
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="add" className="animate-in fade-in duration-500">
             <Card className="border-none shadow-sm bg-white rounded-none max-w-2xl mx-auto overflow-hidden">
                <div className="bg-primary p-12 text-primary-foreground flex justify-between items-center">
                   <div className="space-y-2">
                      <h2 className="text-2xl font-serif tracking-widest uppercase">CADASTRO</h2>
                      <p className="text-[9px] opacity-70 tracking-widest font-light">ADICIONE MÚLTIPLOS CONVITES</p>
                   </div>
                   <Tooltip>
                     <TooltipTrigger asChild>
                        <Button 
                          onClick={handleAddGuests} 
                          disabled={registering || !newGuestsText.trim()}
                          size="icon"
                          className="bg-white text-primary hover:bg-stone-100 h-14 w-14 rounded-none shadow-xl"
                        >
                          {registering ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR LISTA</TooltipContent>
                   </Tooltip>
                </div>
                <CardContent className="p-12 space-y-8">
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="EXEMPLO:&#10;DANIEL LOPES | INDIVIDUAL&#10;FAMILIA SILVA | FAMILIA | JOÃO, MARIA, PEDRO" 
                      className="min-h-[300px] bg-stone-50 border-primary/10 rounded-none focus-visible:ring-primary/20 text-[11px] tracking-widest p-6 leading-relaxed"
                      value={newGuestsText}
                      onChange={(e) => setNewGuestsText(e.target.value)}
                    />
                  </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="config" className="animate-in fade-in duration-500">
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="border-none shadow-sm bg-white rounded-none p-6 sm:p-12">
                <CardHeader className="p-0 space-y-6 flex flex-row justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-serif text-primary tracking-widest flex items-center gap-3">
                      <SettingsIcon className="w-5 h-5" />
                      VISUAL
                    </CardTitle>
                    <Separator className="w-12 bg-primary/20" />
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        size="icon"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 rounded-none shadow-xl"
                      >
                        {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR ALTERAÇÕES</TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent className="p-0 pt-10 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-40 tracking-widest">IMAGEM DO CONVITE (URL)</label>
                    <Input 
                      value={invitationUrl}
                      onChange={(e) => setInvitationUrl(e.target.value)}
                      placeholder="/convite.png ou link externo"
                      className="rounded-none border-primary/10 focus-visible:ring-primary/20 tracking-widest h-14 bg-stone-50"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold opacity-40 tracking-widest">PALETA DE CORES / TEMA</label>
                    <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
                      <SelectTrigger className="rounded-none border-primary/10 h-14 tracking-[0.2em] bg-stone-50">
                        <SelectValue placeholder="SELECIONE O TEMA" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-primary/10 uppercase tracking-widest text-xs">
                        <SelectItem value="GOLD" className="py-3">🔱 DOURADO CLASSIC</SelectItem>
                        <SelectItem value="BLUE" className="py-3">❄️ AZUL CELESTE</SelectItem>
                        <SelectItem value="PINK" className="py-3">🌸 ROSA PASTEL</SelectItem>
                        <SelectItem value="BT21" className="py-3">🧸 BT21 POP</SelectItem>
                        <SelectItem value="DARK" className="py-3">🌑 ELEGANT NAVY</SelectItem>
                        <SelectItem value="SAGE" className="py-3">🌿 BOHO SAGE</SelectItem>
                        <SelectItem value="WHITE" className="py-3">⚪ CLASSIC WHITE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
