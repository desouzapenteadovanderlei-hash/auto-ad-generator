import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./FavoriteButton";

export type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  km: number;
  preco: number;
  preco_anterior: number | null;
  fotos: string[];
  status: string;
  promocao: boolean;
  oferta_semana: boolean;
  ultima_unidade: boolean;
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export function VehicleCard({ v }: { v: Vehicle }) {
  const priceDrop = v.preco_anterior && v.preco_anterior > v.preco;
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow py-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to="/veiculos/$id" params={{ id: v.id }}>
          {v.fotos?.[0] ? (
            <img src={v.fotos[0]} alt={`${v.marca} ${v.modelo}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">Sem foto</div>
          )}
        </Link>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {v.oferta_semana && <Badge className="bg-amber-500">Oferta da semana</Badge>}
          {v.promocao && <Badge className="bg-red-500">Promoção</Badge>}
          {v.ultima_unidade && <Badge className="bg-orange-600">Última unidade</Badge>}
          {priceDrop && <Badge className="bg-green-600">Preço caiu</Badge>}
          {v.status === "reservado" && <Badge variant="secondary">Reservado</Badge>}
          {v.status === "vendido" && <Badge variant="secondary">Vendido</Badge>}
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton vehicleId={v.id} variant="icon" />
        </div>
      </div>
      <CardContent className="p-4">
        <Link to="/veiculos/$id" params={{ id: v.id }} className="block">
          <h3 className="font-semibold truncate">{v.marca} {v.modelo}</h3>
          <p className="text-xs text-muted-foreground">{v.ano} · {v.km.toLocaleString("pt-BR")} km</p>
          <div className="mt-2">
            {priceDrop && <p className="text-xs text-muted-foreground line-through">{brl(v.preco_anterior!)}</p>}
            <p className="text-lg font-bold text-primary">{brl(v.preco)}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}