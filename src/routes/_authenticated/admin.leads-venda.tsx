import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/leads-venda")({
  component: LeadsVenda,
});

function LeadsVenda() {
  const { data = [] } = useQuery({
    queryKey: ["leads-venda"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async () => (await (supabase.from("sell_leads" as any).select("*").order("created_at", { ascending: false }))).data ?? [],
  });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Leads de venda ({data.length})</h1>
      <div className="space-y-2">
        {data.map((l: Record<string, unknown>) => (
          <Card key={String(l.id)}><CardContent className="p-3">
            <p className="font-medium">{String(l.nome)} • {String(l.email)} • {String(l.telefone)}</p>
            <p className="text-sm text-muted-foreground">{String(l.marca)} {String(l.modelo)} {String(l.ano)} • {String(l.km)} km {l.preco_desejado ? `• pede ${l.preco_desejado}` : ""}</p>
            {l.observacoes ? <p className="mt-1 text-sm">{String(l.observacoes)}</p> : null}
            <p className="text-xs text-muted-foreground">{new Date(String(l.created_at)).toLocaleString("pt-BR")}</p>
          </CardContent></Card>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">Nenhum lead ainda.</p>}
      </div>
    </div>
  );
}