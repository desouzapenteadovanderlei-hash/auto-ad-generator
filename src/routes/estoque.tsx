import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { VehicleCard, type Vehicle } from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque de Seminovos — VSP" },
      { name: "description", content: "Confira nossos veículos seminovos revisados. Favorite e receba alertas de ofertas." },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [q, setQ] = useState("");
  const [ord, setOrd] = useState("recentes");

  useEffect(() => {
    supabase.from("vehicles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setVehicles((data ?? []) as Vehicle[]);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) =>
      `${v.marca} ${v.modelo} ${v.ano}`.toLowerCase().includes(q.toLowerCase()),
    );
    if (ord === "menor") list = [...list].sort((a, b) => a.preco - b.preco);
    if (ord === "maior") list = [...list].sort((a, b) => b.preco - a.preco);
    return list;
  }, [vehicles, q, ord]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nosso estoque</h1>
          <p className="text-muted-foreground">Favorite os veículos que te interessam para receber alertas de ofertas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input placeholder="Buscar marca, modelo, ano..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <Select value={ord} onValueChange={setOrd}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor">Menor preço</SelectItem>
              <SelectItem value="maior">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
        {filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">Nenhum veículo encontrado.</p>}
      </main>
    </div>
  );
}