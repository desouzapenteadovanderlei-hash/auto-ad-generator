import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/components/VehicleCard";

export const Route = createFileRoute("/veiculos/$id")({
  head: () => ({ meta: [{ title: "Veículo — VSP Seminovos" }] }),
  component: VehicleDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background"><SiteHeader /><div className="container mx-auto p-8 text-center"><h1 className="text-2xl font-bold">Veículo não encontrado</h1><Link to="/estoque" className="text-primary underline">Ver estoque</Link></div></div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background"><SiteHeader /><div className="container mx-auto p-8 text-center"><p>{error.message}</p></div></div>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

function VehicleDetail() {
  const { id } = Route.useParams();
  const [v, setV] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("vehicles").select("*").eq("id", id).maybeSingle().then(({ data }) => { setV(data as Vehicle | null); setLoading(false); });
  }, [id]);
  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="container mx-auto p-8">Carregando...</div></div>;
  if (!v) throw notFound();
  const priceDrop = v.preco_anterior && v.preco_anterior > v.preco;
  const d = v as unknown as { cor?: string; combustivel?: string; cambio?: string; descricao?: string };
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            {v.fotos?.[0] && <img src={v.fotos[0]} alt={`${v.marca} ${v.modelo}`} className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {v.oferta_semana && <Badge className="bg-amber-500">Oferta da semana</Badge>}
              {v.promocao && <Badge className="bg-red-500">Promoção</Badge>}
              {v.ultima_unidade && <Badge className="bg-orange-600">Última unidade</Badge>}
              {priceDrop && <Badge className="bg-green-600">Preço caiu</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{v.marca} {v.modelo}</h1>
            <p className="text-muted-foreground">{v.ano} · {v.km.toLocaleString("pt-BR")} km {d.cor && `· ${d.cor}`} {d.combustivel && `· ${d.combustivel}`} {d.cambio && `· ${d.cambio}`}</p>
            <div className="my-4">
              {priceDrop && <p className="text-sm text-muted-foreground line-through">{brl(v.preco_anterior!)}</p>}
              <p className="text-4xl font-bold text-primary">{brl(v.preco)}</p>
            </div>
            <FavoriteButton vehicleId={v.id} />
            {d.descricao && <p className="mt-6 text-sm text-muted-foreground whitespace-pre-line">{d.descricao}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}