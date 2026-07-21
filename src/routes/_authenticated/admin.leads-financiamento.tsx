import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/leads-financiamento")({
  component: LeadsFin,
});

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function LeadsFin() {
  const { data = [] } = useQuery({
    queryKey: ["leads-fin"],
    queryFn: async () => (await supabase.from("financing_leads").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Leads de financiamento ({data.length})</h1>
      <div className="space-y-2">
        {data.map((l: Record<string, unknown> & { id: string; created_at: string }) => (
          <Card key={l.id}><CardContent className="p-3">
            <p className="font-medium">{String(l.nome ?? l.name ?? "")} • {String(l.email ?? "")} • {String(l.telefone ?? l.phone ?? "")}</p>
            <p className="text-sm text-muted-foreground">Veículo {BRL.format(Number(l.valor_veiculo ?? l.vehicle_price ?? 0))} • Entrada {BRL.format(Number(l.entrada ?? l.down_payment ?? 0))} • {String(l.prazo ?? l.term_months ?? "")}x • {String(l.taxa_juros ?? l.interest_rate ?? "")}% a.m. • Parcela {BRL.format(Number(l.valor_parcela ?? l.monthly_payment ?? 0))}</p>
            <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</p>
          </CardContent></Card>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">Nenhum lead ainda.</p>}
      </div>
    </div>
  );
}