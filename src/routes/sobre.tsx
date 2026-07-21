import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Wrench, Award } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a VSP — VSP Veículos" },
      { name: "description", content: "Conheça a VSP Comércio de Veículos LTDA: tradição, procedência e atendimento pessoal." },
      { property: "og:title", content: "Sobre a VSP" },
      { property: "og:description", content: "Tradição, procedência e atendimento pessoal." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Sobre a VSP Comércio de Veículos LTDA</h1>
      <p className="mt-4 text-muted-foreground">
        Há mais de uma década no mercado, a VSP se dedica à venda de veículos seminovos de procedência, oferecendo
        um estoque revisado, financiamento facilitado e atendimento humano do início ao pós-venda.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { icon: ShieldCheck, title: "Procedência garantida", desc: "Laudo cautelar em todos os veículos e histórico verificado." },
          { icon: Wrench, title: "Revisão completa", desc: "Cada carro passa por checklist técnico antes de ir ao estoque." },
          { icon: Users, title: "Atendimento pessoal", desc: "Consultores experientes te ajudam a escolher o carro certo." },
          { icon: Award, title: "Garantia de 3 meses", desc: "Garantia real para você dirigir tranquilo após a compra." },
        ].map((it) => (
          <div key={it.title} className="rounded-lg border bg-card p-4">
            <it.icon className="h-6 w-6 text-primary" />
            <p className="mt-2 font-semibold">{it.title}</p>
            <p className="text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}