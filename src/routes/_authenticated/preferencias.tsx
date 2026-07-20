import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/preferencias")({
  head: () => ({ meta: [{ title: "Preferências — VSP" }] }),
  component: Preferencias,
});

type Prefs = { notif_queda_preco: boolean; notif_promocao: boolean; notif_oferta_semana: boolean; notif_ultima_unidade: boolean; canal_email: boolean };

function Preferencias() {
  const { user } = useAuth();
  const [p, setP] = useState<Prefs>({ notif_queda_preco: true, notif_promocao: true, notif_oferta_semana: true, notif_ultima_unidade: true, canal_email: true });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("alert_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setP(data as Prefs); });
  }, [user]);
  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("alert_preferences").upsert({ user_id: user.id, ...p });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Salvo");
  };
  const row = (k: keyof Prefs, label: string, desc: string) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="pr-4"><Label className="font-medium">{label}</Label><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={p[k]} onCheckedChange={(v) => setP({ ...p, [k]: v })} />
    </div>
  );
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Preferências de alerta</h1>
      <Card><CardHeader><CardTitle>Quando avisar</CardTitle></CardHeader><CardContent>
        {row("notif_queda_preco", "Queda de preço", "Preço do favorito diminuiu")}
        {row("notif_promocao", "Promoção", "Marcado como promoção")}
        {row("notif_oferta_semana", "Oferta da semana", "Entrou na vitrine da semana")}
        {row("notif_ultima_unidade", "Última unidade", "Estoque acabando")}
        <div className="pt-4 mt-4 border-t">{row("canal_email", "Receber por e-mail", "Além do sino no site")}</div>
        <Button className="mt-6 w-full" onClick={save} disabled={busy}>Salvar</Button>
      </CardContent></Card>
    </main>
  );
}