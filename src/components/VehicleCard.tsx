import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, Gauge, Calendar } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";

export type VehicleRow = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  km: number;
  cor: string | null;
  combustivel: string | null;
  cambio: string | null;
  preco: number;
  preco_anterior: number | null;
  status: string;
  promocao: boolean;
  oferta_semana: boolean;
  ultima_unidade: boolean;
  fotos: string[];
  descricao: string | null;
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const KM = new Intl.NumberFormat("pt-BR");

export function VehicleCard({ v }: { v: VehicleRow }) {
  const foto = v.fotos?.[0] ?? "https://placehold.co/1200x800?text=Sem+foto";
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to="/veiculo/$id" params={{ id: v.id }}>
          <img src={foto} alt={`${v.marca} ${v.modelo} ${v.ano}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy" />
        </Link>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {v.oferta_semana && <Badge className="bg-amber-500 text-white">Oferta da semana</Badge>}
          {v.promocao && <Badge className="bg-rose-600 text-white">Promoção</Badge>}
          {v.ultima_unidade && <Badge variant="secondary">Última unidade</Badge>}
          {v.status === "reservado" && <Badge variant="outline" className="bg-background">Reservado</Badge>}
        </div>
        <div className="absolute right-2 top-2">
          <FavoriteButton vehicleId={v.id} />
        </div>
      </div>
      <CardContent className="p-4">
        <Link to="/veiculo/$id" params={{ id: v.id }} className="block">
          <h3 className="line-clamp-1 text-base font-semibold">{v.marca} {v.modelo}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{v.ano}</span>
          <span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" />{KM.format(v.km)} km</span>
          {v.combustivel && <span className="inline-flex items-center gap-1"><Fuel className="h-3 w-3" />{v.combustivel}</span>}
          {v.cambio && <span>{v.cambio}</span>}
        </div>
        <div className="mt-3">
          {v.preco_anterior && Number(v.preco_anterior) > Number(v.preco) && (
            <p className="text-xs text-muted-foreground line-through">{BRL.format(Number(v.preco_anterior))}</p>
          )}
          <p className="text-xl font-bold text-primary">{BRL.format(Number(v.preco))}</p>
        </div>
      </CardContent>
    </Card>
  );
}