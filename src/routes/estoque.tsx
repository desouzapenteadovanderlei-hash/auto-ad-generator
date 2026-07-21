import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleCard, type VehicleRow } from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque de Seminovos — VSP Veículos" },
      { name: "description", content: "Confira o estoque de veículos seminovos da VSP: filtre por marca, preço, ano e câmbio." },
      { property: "og:title", content: "Estoque de Seminovos — VSP Veículos" },
      { property: "og:description", content: "Filtre e encontre o seminovo ideal na VSP Veículos." },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const [search, setSearch] = useState("");
  const [marca, setMarca] = useState("all");
  const [cambio, setCambio] = useState("all");
  const [combustivel, setCombustivel] = useState("all");
  const [ordem, setOrdem] = useState("recentes");
  const [precoMax, setPrecoMax] = useState(300000);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: async (): Promise<VehicleRow[]> => {
      const { data } = await supabase.from("vehicles").select("*").eq("status", "disponivel");
      return (data ?? []) as unknown as VehicleRow[];
    },
  });

  const marcas = useMemo(() => Array.from(new Set(vehicles.map(v => v.marca))).sort(), [vehicles]);

  const filtered = useMemo(() => {
    let list = vehicles.filter(v =>
      (!search || `${v.marca} ${v.modelo}`.toLowerCase().includes(search.toLowerCase())) &&
      (marca === "all" || v.marca === marca) &&
      (cambio === "all" || v.cambio === cambio) &&
      (combustivel === "all" || v.combustivel === combustivel) &&
      Number(v.preco) <= precoMax
    );
    if (ordem === "menor") list = [...list].sort((a, b) => Number(a.preco) - Number(b.preco));
    else if (ordem === "maior") list = [...list].sort((a, b) => Number(b.preco) - Number(a.preco));
    else if (ordem === "km") list = [...list].sort((a, b) => a.km - b.km);
    else if (ordem === "ano") list = [...list].sort((a, b) => b.ano - a.ano);
    return list;
  }, [vehicles, search, marca, cambio, combustivel, precoMax, ordem]);

  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Estoque</h1>
        <p className="text-sm text-muted-foreground">Encontre o seminovo ideal.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="space-y-4 rounded-lg border bg-card p-4 lg:col-span-1 h-fit sticky top-20">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input placeholder="Marca ou modelo" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={marca} onValueChange={setMarca}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Câmbio</Label>
            <Select value={cambio} onValueChange={setCambio}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Automático">Automático</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Combustível</Label>
            <Select value={combustivel} onValueChange={setCombustivel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Flex">Flex</SelectItem>
                <SelectItem value="Gasolina">Gasolina</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Elétrico">Elétrico</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><Label>Preço até</Label><span className="text-xs">{BRL.format(precoMax)}</span></div>
            <Slider min={20000} max={300000} step={5000} value={[precoMax]} onValueChange={v => setPrecoMax(v[0] ?? 300000)} />
          </div>
          <div className="space-y-2">
            <Label>Ordenar</Label>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="menor">Menor preço</SelectItem>
                <SelectItem value="maior">Maior preço</SelectItem>
                <SelectItem value="km">Menor km</SelectItem>
                <SelectItem value="ano">Ano mais novo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {
            setSearch(""); setMarca("all"); setCambio("all"); setCombustivel("all"); setPrecoMax(300000); setOrdem("recentes");
          }}>Limpar filtros</Button>
        </aside>
        <section className="lg:col-span-3">
          <p className="mb-4 text-sm text-muted-foreground">{isLoading ? "Carregando..." : `${filtered.length} veículo(s)`}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
          {!isLoading && filtered.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">Nenhum veículo com esses filtros.</p>
          )}
        </section>
      </div>
    </div>
  );
}