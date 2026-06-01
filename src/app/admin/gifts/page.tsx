"use client";

import { useState, useEffect } from "react";
import { getGifts, addGift, deleteGift } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift, Trash2, Plus, Loader2, Package } from "lucide-react";

export default function GiftsAdminPage() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchGifts(); }, []);

  const fetchGifts = async () => {
    const data = await getGifts();
    setGifts(data);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await addGift(newName);
    if (res.success) { setNewName(""); fetchGifts(); toast.success("PRESENTE ADICIONADO"); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir item?")) return;
    const res = await deleteGift(id);
    if (res.success) fetchGifts();
  };

  return (
    <div className="max-w-7xl space-y-12 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Lista de Presentes</h1>
        <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Gerencie os itens da vitrine</p>
      </header>

      <Card className="border-none shadow-2xl bg-white rounded-none p-8 max-w-3xl">
        <div className="flex gap-4">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NOME DO PRESENTE (EX: MAMADEIRA, CUEIRO...)" className="h-14 rounded-none border-primary/10 tracking-widest uppercase text-[11px]" />
          <Button onClick={handleAdd} disabled={loading} className="h-14 px-8 rounded-none">{loading ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} ADICIONAR</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {gifts.map(g => (
          <Card key={g.id} className={`rounded-none border-none shadow-lg overflow-hidden transition-all ${g.isReserved ? 'opacity-40' : 'hover:translate-y-[-4px]'}`}>
            <div className={`h-1 w-full ${g.isReserved ? 'bg-stone-300' : 'bg-primary'}`} />
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-widest uppercase">{g.name}</p>
                <p className="text-[8px] opacity-40 tracking-widest uppercase">{g.isReserved ? "RESERVADO" : "DISPONÍVEL"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
        {gifts.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-20">
            <Package className="h-12 w-12 mx-auto" />
            <p className="text-[10px] tracking-widest uppercase">Nenhum presente cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
