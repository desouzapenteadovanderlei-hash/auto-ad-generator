import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { VehicleCard, type VehicleRow } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VSP Comércio de Veículos — Seminovos com procedência" },
      { name: "description", content: "Seminovos revisados com garantia, financiamento facilitado e atendimento pessoal na VSP Veículos." },
      { property: "og:title", content: "VSP Comércio de Veículos" },
      { property: "og:description", content: "Seminovos revisados com garantia. Estoque online e simulador de financiamento." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: destaques = [] } = useQuery({
    queryKey: ["home-destaques"],
    queryFn: async (): Promise<VehicleRow[]> => {
      const { data } = await supabase.from("vehicles").select("*")
        .eq("status", "disponivel")
        .or("oferta_semana.eq.true,promocao.eq.true,ultima_unidade.eq.true")
        .order("created_at", { ascending: false }).limit(6);
      return (data ?? []) as unknown as VehicleRow[];
    },
  });
  const { data: recentes = [] } = useQuery({
    queryKey: ["home-recentes"],
    queryFn: async (): Promise<VehicleRow[]> => {
      const { data } = await supabase.from("vehicles").select("*")
        .eq("status", "disponivel").order("created_at", { ascending: false }).limit(6);
      return (data ?? []) as unknown as VehicleRow[];
    },
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Seminovos revisados
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              O carro certo, com a confiança da <span className="text-primary">VSP Veículos</span>.
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Estoque cuidadosamente selecionado, laudo cautelar, garantia de 3 meses e financiamento com as principais bancas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/estoque"><Button size="lg">Ver estoque <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/venda-seu-carro"><Button size="lg" variant="outline">Venda seu carro</Button></Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Procedência garantida" />
              <Feature icon={<Wrench className="h-4 w-4" />} label="Revisão completa" />
              <Feature icon={<Sparkles className="h-4 w-4" />} label="Melhor preço" />
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600"
              alt="Carro em destaque" className="h-full w-full rounded-2xl object-cover shadow-xl" />
          </div>
        </div>
      </section>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ofertas em destaque</h2>
              <p className="text-sm text-muted-foreground">Promoções, ofertas da semana e últimas unidades.</p>
            </div>
            <Link to="/estoque" className="text-sm font-medium text-primary hover:underline">Ver tudo →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        </section>
      )}

      {/* Recentes */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Novidades no estoque</h2>
            <p className="text-sm text-muted-foreground">Os últimos veículos que chegaram na VSP.</p>
          </div>
          <Link to="/estoque" className="text-sm font-medium text-primary hover:underline">Ver tudo →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentes.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
      </section>

      {/* Simulador */}
      <section className="bg-muted/30 py-6">
        <FinancingCalculator />
      </section>
    </main>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-lg border bg-card p-3">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}