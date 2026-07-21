import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function loadRole(uid: string | undefined) {
    if (!uid) { setIsAdmin(false); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.rpc as any)("has_role", { _user_id: uid, _role: "admin" });
      setIsAdmin(Boolean(data));
    } catch { setIsAdmin(false); }
  }

  async function ensureSetup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { await (supabase.rpc as any)("ensure_user_setup"); } catch { /* ignore */ }
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await ensureSetup();
        await loadRole(data.session.user.id);
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(s);
      if (event === "SIGNED_IN" && s?.user) {
        setTimeout(async () => {
          await ensureSetup();
          await loadRole(s.user.id);
        }, 0);
      }
      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        queryClient.clear();
      }
      router.invalidate();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    isAdmin,
    loading,
    refreshRole: async () => loadRole(session?.user?.id),
    signOut: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      router.navigate({ to: "/auth", replace: true });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}