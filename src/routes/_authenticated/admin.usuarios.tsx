import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: Users,
});

function Users() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      return (profs ?? []).map(p => ({ ...p, roles: (roles ?? []).filter(r => r.user_id === p.id).map(r => r.role) }));
    },
  });
  async function toggle(uid: string, isAdmin: boolean) {
    if (isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      toast.success("Admin removido");
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("user_roles").insert({ user_id: uid, role: "admin" } as any);
      toast.success("Promovido a admin");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuários ({data.length})</h1>
      <div className="space-y-2">
        {data.map(u => {
          const isAdmin = u.roles.includes("admin");
          return (
            <Card key={u.id}><CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium">{u.full_name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{u.email} {isAdmin && <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">admin</span>}</p>
              </div>
              <Button size="sm" variant={isAdmin ? "outline" : "default"} onClick={() => toggle(u.id, isAdmin)}>
                {isAdmin ? "Remover admin" : "Promover a admin"}
              </Button>
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}