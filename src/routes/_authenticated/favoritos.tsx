import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { VehicleCard, type Vehicle } from "@/components/VehicleCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({ meta: [{ title: "Meus favoritos — VSP" }] }),
  component: Favoritos,
});

type Notif = { id: string; vehicle_id: string; tipo: string; titulo: string; mensagem: string; lida: boolean };

function Favoritos() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const load = async () => {
    if (!user) return;
    const { data: favs } = await supabase.from("favorites").select("vehicle_id").eq("user_id", user.id);
    const ids = (favs ?? []).map((f) => f.vehicle_id);
    if (ids.length) { const { data: v } = await supabase.from("vehicles").select("*").in("id", ids); setVehicles((v ?? []) as Vehicle[]); } else setVehicles([]);
    const { data: n } = await supabase.from("offer_notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setNotifs((n ?? []) as Notif[]);
  };
  useEffect(() => { load(); }, [user]);
  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("offer_notifications").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
    toast.success("Marcadas como lidas"); load();
  };
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meus favoritos</h1>
        <p className="text-muted-foreground text-sm">Alertas conforme suas <Link to="/preferencias" className="underline">preferências</Link>.</p>
      </div>
      {notifs.length > 0 && (
        <Card className="mb-6"><CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4" />Alertas</h2>
            <Button size="sm" variant="ghost" onClick={markAllRead}><Check className="h-4 w-4 mr-1" />Marcar como lidas</Button>
          </div>
          <ul className="space-y-2 max-h-72 overflow-auto">
            {notifs.map((n) => (
              <li key={n.id} className={`p-3 rounded border ${n.lida ? "opacity-60" : "bg-accent/50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-medium text-sm">{n.titulo}</p><p className="text-xs text-muted-foreground">{n.mensagem}</p></div>
                  <Badge variant="outline" className="shrink-0 text-xs">{n.tipo.replace("_", " ")}</Badge>
                </div>
                <Link to="/veiculos/$id" params={{ id: n.vehicle_id }} className="text-xs text-primary underline mt-1 inline-block">Ver veículo</Link>
              </li>
            ))}
          </ul>
        </CardContent></Card>
      )}
      {vehicles.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">Nenhum favorito ainda.</p><Link to="/estoque"><Button className="mt-4">Ver estoque</Button></Link></CardContent></Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{vehicles.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
      )}
    </main>
  );
}