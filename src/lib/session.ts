/**
 * Client-side session store. The frontend never talks to Supabase: the backend performs all
 * auth calls and hands back tokens, which are kept here (localStorage) and refreshed through
 * the backend shortly before they expire.
 */

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  /** Unix seconds */
  expires_at: number;
  user: AuthUser | null;
}

const STORAGE_KEY = "clientform.session";
const REFRESH_MARGIN_SECONDS = 60;
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

type Listener = (session: Session | null) => void;
const listeners = new Set<Listener>();

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.access_token === "string" && typeof v.refresh_token === "string" && typeof v.expires_at === "number";
}

function read(): Session | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

let current: Session | null = read();

function emit() {
  for (const listener of listeners) listener(current);
}

export function getSession(): Session | null {
  return current;
}

export function setSession(next: Session | null) {
  current = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode): the session still lives in memory for this tab.
  }
  emit();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keep tabs in sync: logging in/out in one tab updates the others.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    current = read();
    emit();
  });
}

let refreshing: Promise<Session | null> | null = null;

async function refresh(session: Session): Promise<Session | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (response.status === 401 || response.status === 400) {
      setSession(null); // refresh token revoked or expired → signed out
      return null;
    }
    if (!response.ok) return session; // transient server issue: keep the current session
    const next = (await response.json()) as Session;
    setSession({ ...next, user: next.user ?? session.user });
    return current;
  } catch {
    return session; // offline: try again on the next request
  }
}

/** A valid access token, refreshing it first if it's about to expire. Null when signed out. */
export async function getAccessToken(): Promise<string | null> {
  const session = current;
  if (!session) return null;
  const secondsLeft = session.expires_at - Date.now() / 1000;
  if (secondsLeft > REFRESH_MARGIN_SECONDS) return session.access_token;

  refreshing ??= refresh(session).finally(() => {
    refreshing = null;
  });
  const next = await refreshing;
  return next?.access_token ?? null;
}
