import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator, Car, CheckCircle2 } from "lucide-react";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

function calcMonthly(principal: number, monthlyRate: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .max(30, "Telefone inválido"),
  vehicle: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export function FinancingCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(80000);
  const [downPayment, setDownPayment] = useState(20000);
  const [termMonths, setTermMonths] = useState(48);
  const [interestRate, setInterestRate] = useState(1.49); // % ao mês

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const financed = Math.max(vehiclePrice - downPayment, 0);
  const { monthly, total, interestTotal } = useMemo(() => {
    const m = calcMonthly(financed, interestRate / 100, termMonths);
    const t = m * termMonths;
    return { monthly: m, total: t, interestTotal: t - financed };
  }, [financed, interestRate, termMonths]);

  const canSubmitSim = vehiclePrice > 0 && downPayment >= 0 && downPayment < vehiclePrice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, email, phone, vehicle, notes });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    if (!canSubmitSim) {
      toast.error("Ajuste os valores da simulação");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("financing_leads")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        vehicle: parsed.data.vehicle || null,
        notes: parsed.data.notes || null,
        vehicle_price: vehiclePrice,
        down_payment: downPayment,
        term_months: termMonths,
        interest_rate: interestRate,
        monthly_payment: Number(monthly.toFixed(2)),
        total_amount: Number(total.toFixed(2)),
        total_interest: Number(interestTotal.toFixed(2)),
      })
      .select("id")
      .single();
    setSubmitting(false);

    if (error || !data) {
      toast.error("Não foi possível enviar sua simulação. Tente novamente.");
      return;
    }
    setSavedId(data.id);
    toast.success("Simulação enviada! Nossa equipe entrará em contato.");
    setName("");
    setEmail("");
    setPhone("");
    setVehicle("");
    setNotes("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Car className="h-3.5 w-3.5" />
          VSP Comércio de Veículos LTDA
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Simulador de Financiamento
        </h1>
        <p className="mt-2 text-muted-foreground">
          Calcule sua parcela por entrada, prazo e taxa. Envie sua simulação e nossa
          equipe entra em contato.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Simulador */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Sua simulação
            </CardTitle>
            <CardDescription>
              Ajuste os valores para ver a parcela em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Valor do veículo</Label>
                <Input
                  id="price"
                  type="number"
                  min={1000}
                  step={500}
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">{BRL.format(vehiclePrice)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="down">Entrada</Label>
                <Input
                  id="down"
                  type="number"
                  min={0}
                  step={500}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {BRL.format(downPayment)} ({vehiclePrice > 0
                    ? Math.round((downPayment / vehiclePrice) * 100)
                    : 0}
                  % do valor)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Prazo</Label>
                <span className="text-sm font-medium">{termMonths} meses</span>
              </div>
              <Slider
                min={6}
                max={72}
                step={6}
                value={[termMonths]}
                onValueChange={(v) => setTermMonths(v[0] ?? 48)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Taxa de juros ao mês</Label>
                <span className="text-sm font-medium">
                  {interestRate.toFixed(2)}% a.m.
                </span>
              </div>
              <Slider
                min={0.5}
                max={3.5}
                step={0.01}
                value={[interestRate]}
                onValueChange={(v) => setInterestRate(v[0] ?? 1.49)}
              />
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Parcela" value={BRL.format(monthly)} highlight />
              <Stat label="Total financiado" value={BRL.format(financed)} />
              <Stat label="Total a pagar" value={BRL.format(total + downPayment)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Juros no período: {BRL.format(interestTotal)}. Valores estimados pela
              tabela Price; a proposta final depende da análise de crédito.
            </p>
          </CardContent>
        </Card>

        {/* Lead form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receber proposta</CardTitle>
            <CardDescription>
              Preencha seus dados para salvar a simulação e receber contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedId ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <p className="font-medium">Simulação enviada com sucesso!</p>
                <p className="text-sm text-muted-foreground">
                  Um consultor da VSP entrará em contato em breve.
                </p>
                <Button variant="outline" onClick={() => setSavedId(null)}>
                  Fazer nova simulação
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                    placeholder="(11) 99999-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Veículo de interesse (opcional)</Label>
                  <Input
                    id="vehicle"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    maxLength={120}
                    placeholder="Ex: Honda Civic 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar simulação"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Ao enviar, você concorda em receber contato da VSP sobre esta simulação.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "bg-primary text-primary-foreground" : "bg-muted/40"
      }`}
    >
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}