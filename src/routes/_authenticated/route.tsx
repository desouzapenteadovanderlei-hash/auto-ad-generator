import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  component: Gate,
});

function Gate() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth", replace: true }); }, [user, loading, nav]);
  if (loading || !user) return <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>;
  return <Outlet />;
}