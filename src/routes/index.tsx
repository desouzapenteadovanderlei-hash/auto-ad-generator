import { createFileRoute } from "@tanstack/react-router";
import { FinancingCalculator } from "@/components/FinancingCalculator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de Financiamento — VSP Comércio de Veículos" },
      {
        name: "description",
        content:
          "Simule o financiamento do seu veículo seminovo na VSP: calcule parcela, entrada, prazo e taxa em segundos.",
      },
      { property: "og:title", content: "Simulador de Financiamento — VSP Comércio de Veículos" },
      {
        property: "og:description",
        content: "Calcule sua parcela em segundos e receba a proposta por e-mail.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <FinancingCalculator />
    </main>
  );
}
