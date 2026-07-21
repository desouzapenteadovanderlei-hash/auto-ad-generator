import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const [v, l, s, f] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
        supabase.from("financing_leads").select("id", { count: "exact", head: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("sell_leads" as any).select("id", { count: "exact", head: true })),
        supabase.from("favorites").select("id", { count: "exact", head: true }),
      ]);
      return { veiculos: v.count ?? 0, finLeads: l.count ?? 0, sellLeads: s.count ?? 0, favs: f.count ?? 0 };
    },
  });
  const items = [
    { label: "Veículos", value: data?.veiculos ?? "—" },
    { label: "Leads financiamento", value: data?.finLeads ?? "—" },
    { label: "Leads venda", value: data?.sellLeads ?? "—" },
    { label: "Favoritos totais", value: data?.favs ?? "—" },
  ];
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Painel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(i => (
          <Card key={i.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{i.label}</p>
            <p className="mt-1 text-2xl font-bold">{i.value}</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}