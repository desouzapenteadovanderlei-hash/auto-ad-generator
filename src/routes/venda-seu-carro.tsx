import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/venda-seu-carro")({
  head: () => ({
    meta: [
      { title: "Venda seu carro — VSP Veículos" },
      { name: "description", content: "Avaliamos e compramos o seu veículo. Preencha e receba uma proposta rápida." },
      { property: "og:title", content: "Venda seu carro — VSP Veículos" },
      { property: "og:description", content: "Receba uma proposta rápida pelo seu veículo." },
    ],
  }),
  component: Vender,
});

const schema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  telefone: z.string().trim().min(8).max(30),
  marca: z.string().trim().min(2).max(60),
  modelo: z.string().trim().min(1).max(80),
  ano: z.coerce.number().int().min(1950).max(2100),
  km: z.coerce.number().int().min(0),
  preco_desejado: z.coerce.number().min(0).optional(),
  observacoes: z.string().max(1000).optional(),
});

function Vender() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos"); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("sell_leads" as any).insert(parsed.data));
    setLoading(false);
    if (error) { toast.error("Não foi possível enviar. Tente novamente."); return; }
    toast.success("Recebemos seu carro! Entraremos em contato.");
    setOk(true);
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Venda seu carro para a VSP</CardTitle>
          <p className="text-sm text-muted-foreground">Preencha e recebemos sua proposta em até 24h.</p>
        </CardHeader>
        <CardContent>
          {ok ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="font-medium">Recebido!</p>
              <p className="text-sm text-muted-foreground">Nosso comprador entrará em contato em breve.</p>
              <Button variant="outline" onClick={() => setOk(false)}>Enviar outro</Button>
            </div>
          ) : (
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Nome</Label><Input name="nome" required maxLength={120} /></div>
            <div className="space-y-2"><Label>E-mail</Label><Input name="email" type="email" required maxLength={255} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input name="telefone" required maxLength={30} placeholder="(11) 99999-0000" /></div>
            <div className="space-y-2"><Label>Marca</Label><Input name="marca" required maxLength={60} /></div>
            <div className="space-y-2"><Label>Modelo</Label><Input name="modelo" required maxLength={80} /></div>
            <div className="space-y-2"><Label>Ano</Label><Input name="ano" type="number" min={1950} max={2100} required /></div>
            <div className="space-y-2"><Label>KM</Label><Input name="km" type="number" min={0} required /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Valor desejado (opcional)</Label><Input name="preco_desejado" type="number" min={0} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Observações</Label><Textarea name="observacoes" rows={3} maxLength={1000} /></div>
            <div className="sm:col-span-2"><Button type="submit" className="w-full" disabled={loading}>{loading ? "Enviando..." : "Enviar proposta"}</Button></div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}