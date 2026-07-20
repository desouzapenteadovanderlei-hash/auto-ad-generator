import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FavoriteButton({ vehicleId, variant = "default" }: { vehicleId: string; variant?: "default" | "icon" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setFav(false); return; }
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("vehicle_id", vehicleId).maybeSingle()
      .then(({ data }) => setFav(!!data));
  }, [user, vehicleId]);

  const toggle = async () => {
    if (!user) {
      toast.info("Faça login para salvar favoritos");
      router.navigate({ to: "/auth" });
      return;
    }
    setLoading(true);
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("vehicle_id", vehicleId);
      setFav(false);
      toast.success("Removido dos favoritos");
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, vehicle_id: vehicleId });
      if (error) toast.error(error.message);
      else { setFav(true); toast.success("Adicionado aos favoritos! Você receberá alertas de ofertas."); }
    }
    setLoading(false);
  };

  if (variant === "icon") {
    return (
      <Button size="icon" variant="secondary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }} disabled={loading} aria-label="Favoritar">
        <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
      </Button>
    );
  }
  return (
    <Button onClick={toggle} disabled={loading} variant={fav ? "secondary" : "default"} className="gap-2">
      <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
      {fav ? "Favoritado" : "Favoritar"}
    </Button>
  );
}