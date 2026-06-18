import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: Role[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SESSION_STARTED_AT_KEY = "kiva-auth-session-started-at";

export async function getPostAuthDestination(userId?: string | null) {
  if (!userId) return "/";

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as Role);

  return roles.includes("admin") ? "/dashboard" : "/dashboard";
}

function readSessionStartedAt() {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!value) return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function writeSessionStartedAt(timestamp: number) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(timestamp));
}

function clearSessionStartedAt() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionExpiryTimerRef = useRef<number | null>(null);

  const clearSessionExpiryTimer = () => {
    if (sessionExpiryTimerRef.current !== null) {
      window.clearTimeout(sessionExpiryTimerRef.current);
      sessionExpiryTimerRef.current = null;
    }
  };

  const scheduleSessionExpiry = (startedAt: number) => {
    clearSessionExpiryTimer();

    const elapsedMs = Date.now() - startedAt;
    const remainingMs = SESSION_MAX_AGE_MS - elapsedMs;

    if (remainingMs <= 0) {
      void handleSessionExpired();
      return;
    }

    sessionExpiryTimerRef.current = window.setTimeout(() => {
      void handleSessionExpired();
    }, remainingMs);
  };

  const handleSessionExpired = async () => {
    clearSessionExpiryTimer();
    clearSessionStartedAt();
    setRoles([]);
    setSession(null);
    setUser(null);
    await supabase.auth.signOut();
  };

  const syncSessionState = async (sess: Session | null) => {
    setSession(sess);
    setUser(sess?.user ?? null);

    if (!sess) {
      clearSessionExpiryTimer();
      clearSessionStartedAt();
      setRoles([]);
      setLoading(false);
      return;
    }

    const startedAt = readSessionStartedAt() ?? Date.now();
    if (!readSessionStartedAt()) {
      writeSessionStartedAt(startedAt);
    }

    if (Date.now() - startedAt >= SESSION_MAX_AGE_MS) {
      await handleSessionExpired();
      setLoading(false);
      return;
    }

    scheduleSessionExpiry(startedAt);
    await fetchRoles(sess.user?.id);
    setLoading(false);
  };

  const fetchRoles = async (uid: string | undefined) => {
    if (!uid) return setRoles([]);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as Role));
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Defer to avoid deadlocks
      setTimeout(() => {
        void syncSessionState(sess);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      void syncSessionState(sess);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearSessionExpiryTimer();
    clearSessionStartedAt();
    await supabase.auth.signOut();
    setRoles([]);
  };

  const refreshRoles = async () => fetchRoles(user?.id);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        roles,
        isAdmin: roles.includes("admin"),
        isAuthenticated: !!session,
        loading,
        signOut,
        refreshRoles,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
