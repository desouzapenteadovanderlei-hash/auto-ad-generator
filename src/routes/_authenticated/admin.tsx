import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Car, Users, Inbox, Home, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading, user, refreshRole } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !isAdmin) { /* stay to show claim */ } }, [loading, isAdmin]);

  async function claimAdmin() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (await import("@/integrations/supabase/client")).supabase.rpc("claim_first_admin" as any);
    if (error) return alert(error.message);
    if (data) { await refreshRole(); }
    else alert("Já existe um admin. Peça a um administrador para promover você.");
  }

  if (loading) return <div className="p-10">Carregando...</div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-lg p-10 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
      <h1 className="mt-3 text-2xl font-bold">Acesso restrito</h1>
      <p className="mt-2 text-sm text-muted-foreground">Você não é administrador.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={claimAdmin}>Tornar-me o primeiro admin</Button>
        <Button variant="outline" onClick={() => nav({ to: "/" })}>Voltar</Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Sessão: {user?.email}</p>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <NavItem to="/admin" icon={<Home className="h-4 w-4" />} label="Dashboard" />
        <NavItem to="/admin/veiculos" icon={<Car className="h-4 w-4" />} label="Veículos" />
        <NavItem to="/admin/leads-financiamento" icon={<Inbox className="h-4 w-4" />} label="Leads financiamento" />
        <NavItem to="/admin/leads-venda" icon={<Inbox className="h-4 w-4" />} label="Leads venda" />
        <NavItem to="/admin/usuarios" icon={<Users className="h-4 w-4" />} label="Usuários" />
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-accent text-foreground" }}
      activeOptions={{ exact: to === "/admin" }}>
      {icon}{label}
    </Link>
  );
}