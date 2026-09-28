import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { queryCache } from "@/lib/queryCache";
import { type AuthUser, getSession, type Session, setSession, subscribe } from "@/lib/session";

interface AuthContextValue {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setState] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const unsubscribe = subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Never show one account's cached data to another: clear the cache when the user changes.
  const userId = session?.user?.id ?? null;
  const previousUserId = useRef(userId);
  useEffect(() => {
    if (previousUserId.current !== userId) queryCache.clear();
    previousUserId.current = userId;
  }, [userId]);

  // Sessions created by a redirect (e.g. email confirmation) may not include the user yet.
  const needsUser = Boolean(session && !session.user);
  useEffect(() => {
    if (!needsUser) return;
    api.auth
      .me()
      .then((user) => {
        const current = getSession();
        if (current) setSession({ ...current, user });
      })
      .catch(() => setSession(null));
  }, [needsUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading: needsUser,
      signOut: async () => {
        await api.auth.logout().catch(() => undefined);
        setSession(null);
      },
    }),
    [session, needsUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
