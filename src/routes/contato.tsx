import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — VSP Veículos" },
      { name: "description", content: "Fale com a VSP: telefone, e-mail e endereço da loja." },
      { property: "og:title", content: "Contato — VSP Veículos" },
      { property: "og:description", content: "Fale com a VSP: telefone, e-mail e endereço." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contato</h1>
      <p className="mt-2 text-muted-foreground">Nossa equipe está pronta para te atender.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-4"><Phone className="h-5 w-5 text-primary" /><p className="mt-2 font-semibold">Telefone / WhatsApp</p><p className="text-sm text-muted-foreground">(11) 4000-0000</p></CardContent></Card>
        <Card><CardContent className="p-4"><Mail className="h-5 w-5 text-primary" /><p className="mt-2 font-semibold">E-mail</p><p className="text-sm text-muted-foreground">contato@vspveiculos.com.br</p></CardContent></Card>
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-primary" /><p className="mt-2 font-semibold">Endereço</p><p className="text-sm text-muted-foreground">Av. Exemplo, 1000 — São Paulo/SP</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-primary" /><p className="mt-2 font-semibold">Horário</p><p className="text-sm text-muted-foreground">Seg-Sex 9h-19h • Sáb 9h-17h</p></CardContent></Card>
      </div>
    </div>
  );
}