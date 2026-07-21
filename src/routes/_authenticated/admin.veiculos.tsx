import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { VehicleRow } from "@/components/VehicleCard";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/veiculos")({
  component: AdminVeiculos,
});

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function empty(): Partial<VehicleRow> {
  return { marca: "", modelo: "", ano: new Date().getFullYear(), km: 0, cor: "", combustivel: "Flex", cambio: "Manual", preco: 0, status: "disponivel", promocao: false, oferta_semana: false, ultima_unidade: false, fotos: [], descricao: "" };
}

function AdminVeiculos() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<VehicleRow>>(empty());
  const [fotosText, setFotosText] = useState("");

  const { data: list = [] } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async (): Promise<VehicleRow[]> => {
      const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
      return (data ?? []) as unknown as VehicleRow[];
    },
  });

  function openNew() { setEditing(empty()); setFotosText(""); setOpen(true); }
  function openEdit(v: VehicleRow) { setEditing(v); setFotosText((v.fotos ?? []).join("\n")); setOpen(true); }

  async function save() {
    const fotos = fotosText.split("\n").map(s => s.trim()).filter(Boolean);
    const payload = { ...editing, fotos, preco: Number(editing.preco), km: Number(editing.km), ano: Number(editing.ano) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = payload;
    const { error } = editing.id
      ? await supabase.from("vehicles").update(p).eq("id", editing.id)
      : await supabase.from("vehicles").insert(p);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    qc.invalidateQueries({ queryKey: ["estoque"] });
  }
  async function remove(id: string) {
    if (!confirm("Excluir veículo?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); qc.invalidateQueries({ queryKey: ["admin-vehicles"] }); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Veículos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Novo</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "Editar veículo" : "Novo veículo"}</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Marca"><Input value={editing.marca ?? ""} onChange={e => setEditing({ ...editing, marca: e.target.value })} /></F>
              <F label="Modelo"><Input value={editing.modelo ?? ""} onChange={e => setEditing({ ...editing, modelo: e.target.value })} /></F>
              <F label="Ano"><Input type="number" value={editing.ano ?? ""} onChange={e => setEditing({ ...editing, ano: Number(e.target.value) })} /></F>
              <F label="KM"><Input type="number" value={editing.km ?? 0} onChange={e => setEditing({ ...editing, km: Number(e.target.value) })} /></F>
              <F label="Preço"><Input type="number" value={editing.preco ?? 0} onChange={e => setEditing({ ...editing, preco: Number(e.target.value) })} /></F>
              <F label="Cor"><Input value={editing.cor ?? ""} onChange={e => setEditing({ ...editing, cor: e.target.value })} /></F>
              <F label="Combustível"><Input value={editing.combustivel ?? ""} onChange={e => setEditing({ ...editing, combustivel: e.target.value })} /></F>
              <F label="Câmbio"><Input value={editing.cambio ?? ""} onChange={e => setEditing({ ...editing, cambio: e.target.value })} /></F>
              <F label="Status"><Input value={editing.status ?? "disponivel"} onChange={e => setEditing({ ...editing, status: e.target.value })} /></F>
              <div className="sm:col-span-2"><Label>Descrição</Label><Textarea rows={3} value={editing.descricao ?? ""} onChange={e => setEditing({ ...editing, descricao: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Fotos (uma URL por linha)</Label><Textarea rows={3} value={fotosText} onChange={e => setFotosText(e.target.value)} /></div>
              <div className="flex items-center justify-between rounded border p-2"><Label>Promoção</Label><Switch checked={!!editing.promocao} onCheckedChange={v => setEditing({ ...editing, promocao: v })} /></div>
              <div className="flex items-center justify-between rounded border p-2"><Label>Oferta da semana</Label><Switch checked={!!editing.oferta_semana} onCheckedChange={v => setEditing({ ...editing, oferta_semana: v })} /></div>
              <div className="flex items-center justify-between rounded border p-2"><Label>Última unidade</Label><Switch checked={!!editing.ultima_unidade} onCheckedChange={v => setEditing({ ...editing, ultima_unidade: v })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {list.map(v => (
          <Card key={v.id}><CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <img src={v.fotos?.[0] ?? "https://placehold.co/120x80"} alt="" className="h-16 w-24 rounded object-cover" />
              <div>
                <p className="font-medium">{v.marca} {v.modelo} <span className="text-muted-foreground">({v.ano})</span></p>
                <p className="text-sm text-muted-foreground">{BRL.format(Number(v.preco))} • {v.status}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}