import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VehicleCard, type VehicleRow } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/favoritos")({
  component: Favoritos,
});

function Favoritos() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["favorites-list", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<VehicleRow[]> => {
      const { data } = await supabase.from("favorites").select("vehicle_id, vehicles(*)").eq("user_id", user!.id);
      return ((data ?? []).map(r => (r as { vehicles: VehicleRow }).vehicles).filter(Boolean)) as VehicleRow[];
    },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Meus favoritos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Veículos que você salvou.</p>
      {isLoading ? <p className="mt-8">Carregando...</p> :
       data.length === 0 ? (
         <div className="mt-10 text-center">
           <p className="text-muted-foreground">Você ainda não favoritou nenhum veículo.</p>
           <Link to="/estoque"><Button className="mt-4">Ir para o estoque</Button></Link>
         </div>
       ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
       )}
    </div>
  );
}