import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — VSP Veículos" },
      { name: "description", content: "Acesse sua conta VSP para salvar favoritos e receber alertas de ofertas." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email();
const passSchema = z.string().min(6, "Senha de pelo menos 6 caracteres");

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav({ to: "/" }); }, [user, loading, nav]);

  async function signIn() {
    if (!emailSchema.safeParse(email).success || !passSchema.safeParse(password).success) {
      toast.error("Verifique e-mail e senha"); return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bem-vindo!");
  }

  async function signUp() {
    if (!emailSchema.safeParse(email).success || !passSchema.safeParse(password).success) {
      toast.error("Verifique e-mail e senha"); return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Cadastro realizado! Verifique seu e-mail se necessário.");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar com Google");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader><CardTitle className="text-center">Acessar VSP Veículos</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={google}>
            <GoogleIcon /> Continuar com Google
          </Button>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" />
          </div>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-3">
              <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={signIn} disabled={busy}>Entrar</Button>
            </TabsContent>
            <TabsContent value="signup" className="mt-4 space-y-3">
              <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={signUp} disabled={busy}>Criar conta</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}