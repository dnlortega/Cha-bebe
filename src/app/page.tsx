import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-primary tracking-[0.4em]">CHÁ DE BEBÊ</h1>
          <Separator className="w-16 mx-auto bg-primary/30" />
          <p className="text-[10px] tracking-[0.5em] opacity-60">NOSSO MOMENTO ESPECIAL</p>
        </div>
        
        <p className="text-xs tracking-widest leading-relaxed opacity-80 max-w-sm mx-auto">
          ESTAMOS MUITO FELIZES EM COMPARTILHAR ESTE MOMENTO COM VOCÊ. 
          POR FAVOR, UTILIZE O LINK ENVIADO PARA CONFIRMAR SUA PRESENÇA.
        </p>

        <div className="pt-8">
          <Link href="/admin">
            <Button variant="ghost" className="text-[10px] tracking-[0.3em] opacity-30 hover:opacity-100">
              ACESSO RESTRITO
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
