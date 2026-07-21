import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({ vehicleId, className }: { vehicleId: string; className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: fav } = useQuery({
    queryKey: ["favorite", user?.id, vehicleId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("id")
        .eq("user_id", user!.id).eq("vehicle_id", vehicleId).maybeSingle();
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      if (fav) {
        const { error } = await supabase.from("favorites").delete().eq("id", fav.id);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: user.id, vehicle_id: vehicleId });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (added) => {
      qc.invalidateQueries({ queryKey: ["favorite", user?.id, vehicleId] });
      qc.invalidateQueries({ queryKey: ["favorites-list", user?.id] });
      toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    },
    onError: () => toast.error("Não foi possível atualizar favoritos"),
  });

  const active = !!fav;
  return (
    <Button
      variant="secondary" size="icon"
      className={cn("rounded-full bg-background/90 hover:bg-background", className)}
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { toast.info("Entre para salvar veículos"); navigate({ to: "/auth" }); return; }
        toggle.mutate();
      }}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={cn("h-4 w-4", active && "fill-rose-500 text-rose-500")} />
    </Button>
  );
}