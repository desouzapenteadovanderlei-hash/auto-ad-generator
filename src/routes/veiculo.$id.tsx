import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Fuel, Gauge, Palette, Cog, MessageCircle, ArrowLeft } from "lucide-react";
import type { VehicleRow } from "@/components/VehicleCard";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const KM = new Intl.NumberFormat("pt-BR");

export const Route = createFileRoute("/veiculo/$id")({
  head: () => ({
    meta: [
      { title: "Veículo — VSP Veículos" },
      { name: "description", content: "Detalhes do veículo seminovo na VSP." },
    ],
  }),
  component: VeiculoDetalhe,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg p-10 text-center">
      <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
      <Link to="/estoque"><Button className="mt-4">Ver estoque</Button></Link>
    </div>
  ),
});

function VeiculoDetalhe() {
  const { id } = Route.useParams();
  const [foto, setFoto] = useState(0);
  const { data: v, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async (): Promise<VehicleRow | null> => {
      const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
      return (data as unknown as VehicleRow) ?? null;
    },
  });

  if (isLoading) return <div className="p-10 text-center">Carregando...</div>;
  if (!v) { throw notFound(); }

  const fotos = v.fotos?.length ? v.fotos : ["https://placehold.co/1200x800?text=Sem+foto"];
  const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse no ${v.marca} ${v.modelo} ${v.ano} (${BRL.format(Number(v.preco))}).`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/estoque" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao estoque
      </Link>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <img src={fotos[foto]} alt={`${v.marca} ${v.modelo}`} className="h-full w-full object-cover" />
            <div className="absolute right-3 top-3"><FavoriteButton vehicleId={v.id} /></div>
            <div className="absolute left-3 top-3 flex flex-wrap gap-1">
              {v.oferta_semana && <Badge className="bg-amber-500 text-white">Oferta da semana</Badge>}
              {v.promocao && <Badge className="bg-rose-600 text-white">Promoção</Badge>}
              {v.ultima_unidade && <Badge variant="secondary">Última unidade</Badge>}
            </div>
          </div>
          {fotos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setFoto(i)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 ${i === foto ? "border-primary" : "border-transparent"}`}>
                  <img src={f} alt={`Foto ${i+1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {v.descricao && (
            <Card className="mt-6"><CardContent className="p-4">
              <h2 className="mb-2 font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{v.descricao}</p>
            </CardContent></Card>
          )}
        </div>
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardContent className="p-5">
              <h1 className="text-2xl font-bold">{v.marca} {v.modelo}</h1>
              <p className="text-sm text-muted-foreground">{v.ano} • {KM.format(v.km)} km</p>
              <div className="mt-4">
                {v.preco_anterior && Number(v.preco_anterior) > Number(v.preco) && (
                  <p className="text-sm text-muted-foreground line-through">{BRL.format(Number(v.preco_anterior))}</p>
                )}
                <p className="text-3xl font-bold text-primary">{BRL.format(Number(v.preco))}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info icon={<Calendar className="h-4 w-4" />} label="Ano" value={String(v.ano)} />
                <Info icon={<Gauge className="h-4 w-4" />} label="KM" value={KM.format(v.km)} />
                {v.cambio && <Info icon={<Cog className="h-4 w-4" />} label="Câmbio" value={v.cambio} />}
                {v.combustivel && <Info icon={<Fuel className="h-4 w-4" />} label="Combustível" value={v.combustivel} />}
                {v.cor && <Info icon={<Palette className="h-4 w-4" />} label="Cor" value={v.cor} />}
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <a href={`https://wa.me/5511999990000?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                  <Button className="w-full bg-green-600 hover:bg-green-700"><MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp</Button>
                </a>
                <Link to="/" hash="simulador"><Button variant="outline" className="w-full">Simular financiamento</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border bg-muted/30 p-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}