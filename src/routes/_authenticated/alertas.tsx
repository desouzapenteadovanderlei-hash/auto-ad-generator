import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/alertas")({
  component: Alertas,
});

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Alertas() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [prefs, setPrefs] = useState({
    notif_queda_preco: true, notif_promocao: true, notif_oferta_semana: true, notif_ultima_unidade: true, canal_email: false,
  });

  const { data: prefRow } = useQuery({
    queryKey: ["alert-prefs", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("alert_preferences").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  useEffect(() => { if (prefRow) setPrefs({
    notif_queda_preco: prefRow.notif_queda_preco, notif_promocao: prefRow.notif_promocao,
    notif_oferta_semana: prefRow.notif_oferta_semana, notif_ultima_unidade: prefRow.notif_ultima_unidade,
    canal_email: prefRow.canal_email,
  }); }, [prefRow]);

  const { data: notifs = [] } = useQuery({
    queryKey: ["notifs", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("offer_notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  async function save() {
    const { error } = await supabase.from("alert_preferences").upsert({ user_id: user!.id, ...prefs });
    if (error) toast.error("Erro ao salvar"); else toast.success("Preferências salvas");
  }
  async function markRead(id: string) {
    await supabase.from("offer_notifications").update({ lida: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifs", user?.id] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Card>
        <CardHeader><CardTitle>Preferências de alertas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            ["notif_queda_preco","Queda de preço"],
            ["notif_promocao","Promoções"],
            ["notif_oferta_semana","Oferta da semana"],
            ["notif_ultima_unidade","Última unidade"],
            ["canal_email","Receber por e-mail (em breve)"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch checked={prefs[key as keyof typeof prefs]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
            </div>
          ))}
          <Button onClick={save}>Salvar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Meus alertas</CardTitle></CardHeader>
        <CardContent>
          {notifs.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum alerta ainda. Favorite veículos para começar a receber.</p> : (
            <ul className="space-y-3">
              {notifs.map(n => (
                <li key={n.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{n.titulo}</p>
                        {!n.lida && <Badge>Novo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.mensagem}</p>
                      {n.preco_antigo && n.preco_novo && (
                        <p className="mt-1 text-xs">De {BRL.format(Number(n.preco_antigo))} por <strong>{BRL.format(Number(n.preco_novo))}</strong></p>
                      )}
                    </div>
                    {!n.lida && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Marcar lida</Button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}