import { API_URL } from "./config";
import { type AuthUser, getAccessToken, type Session, setSession } from "./session";
import type {
  BillingInterval,
  AdminMode,
  BillingState,
  DashboardData,
  FormDraft,
  FormSummary,
  FormWithContent,
  Profile,
  PublicForm,
  SubmissionDetail,
  SubmissionListItem,
  SubmissionStatus,
  Testimonial,
} from "@/types";


const MISSING_API_URL =
  "The app can't reach its API. Set VITE_API_URL to your backend URL in your hosting settings and redeploy.";

if (import.meta.env.PROD && !API_URL) {
  console.error(
    "VITE_API_URL is not set. In production the frontend can't reach the backend without it. " +
      "Add it in Netlify → Site configuration → Environment variables, then redeploy.",
  );
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Raw file upload (sent as application/octet-stream). */
  file?: Blob;
  query?: Record<string, string>;
  auth?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>(
  path: string,
  { method = "GET", body, file, query, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (file) headers["Content-Type"] = "application/octet-stream";
  else if (body !== undefined) headers["Content-Type"] = "application/json";
  const search = query ? `?${new URLSearchParams(query).toString()}` : "";

  if (auth) {
    const token = await getAccessToken();
    if (!token) throw new ApiError(401, "Your session has expired. Please log in again.");
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}${search}`, {
      method,
      headers,
      body: file ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  // A static host (e.g. Netlify's SPA fallback) answers unknown /api paths with index.html.
  // That means the API URL isn't configured, so say so instead of a vague error.
  if ((response.headers.get("content-type") ?? "").includes("text/html")) {
    throw new ApiError(response.status || 502, MISSING_API_URL);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // The server no longer accepts this session (revoked/expired): sign out locally.
    if (auth && response.status === 401) setSession(null);
    if (response.status === 413) throw new ApiError(413, "That file is too large.");
    const message = isRecord(payload) && typeof payload.error === "string" ? payload.error : "Something went wrong";
    const details = isRecord(payload) && isRecord(payload.details) ? payload.details : null;
    const fields = details && isRecord(details.fields) ? (details.fields as Record<string, string>) : undefined;
    throw new ApiError(response.status, message, fields);
  }

  return payload as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

type ResolvedTestimonial = Omit<Testimonial, "id">;

/** Where to send the browser to start Google sign-in (handled by the backend). */
export function googleSignInUrl(next = "/dashboard") {
  return `${API_URL}/api/auth/google?next=${encodeURIComponent(next)}`;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<Session>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
    signup: (email: string, password: string, name: string) =>
      request<{ session: Session | null; confirmation_required: boolean }>("/auth/signup", {
        method: "POST",
        body: { email, password, name },
        auth: false,
      }),
    me: () => request<AuthUser>("/auth/me"),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
  },

  dashboard: () => request<DashboardData>("/dashboard"),

  profile: {
    get: () => request<Profile>("/profile"),
    update: (patch: Partial<Pick<Profile, "name" | "display_name" | "website_url" | "avatar_url">>) =>
      request<Profile>("/profile", { method: "PATCH", body: patch }),
    uploadAvatar: (file: File) =>
      request<Profile>("/profile/avatar", { method: "POST", file, query: { type: file.type } }),
  },

  forms: {
    list: () => request<FormSummary[]>("/forms"),
    get: (id: string) => request<FormWithContent>(`/forms/${id}`),
    create: (draft: FormDraft) => request<FormWithContent>("/forms", { method: "POST", body: draft }),
    update: (id: string, patch: Partial<FormDraft> & { status?: "draft" | "archived" }) =>
      request<FormWithContent>(`/forms/${id}`, { method: "PATCH", body: patch }),
    remove: (id: string) => request<void>(`/forms/${id}`, { method: "DELETE" }),
    duplicate: (id: string) => request<FormWithContent>(`/forms/${id}/duplicate`, { method: "POST" }),
    publish: (id: string, slug?: string) =>
      request<FormWithContent>(`/forms/${id}/publish`, { method: "POST", body: slug ? { slug } : {} }),
    unpublish: (id: string) => request<FormWithContent>(`/forms/${id}/unpublish`, { method: "POST" }),
  },

  billing: {
    get: () => request<BillingState>("/billing"),
    sync: () => request<BillingState>("/billing/sync", { method: "POST" }),
    checkout: (interval: BillingInterval) =>
      request<{ checkout_url: string }>("/billing/checkout", { method: "POST", body: { interval } }),
    cancel: () => request<BillingState>("/billing/cancel", { method: "POST" }),
    resume: () => request<BillingState>("/billing/resume", { method: "POST" }),
    changeInterval: (interval: BillingInterval) =>
      request<BillingState>("/billing/change-interval", { method: "POST", body: { interval } }),
    portal: () => request<{ url: string }>("/billing/portal", { method: "POST" }),
  },

  admin: {
    setMode: (mode: AdminMode["mode"], test_plan?: AdminMode["test_plan"]) =>
      request<BillingState>("/admin/mode", { method: "PATCH", body: { mode, test_plan } }),
  },

  testimonials: {
    resolve: (url: string) => request<ResolvedTestimonial>("/testimonials/resolve", { method: "POST", body: { url } }),
  },

  submissions: {
    list: (params: { status?: SubmissionStatus; form_id?: string; limit?: number } = {}) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) if (value !== undefined) search.set(key, String(value));
      const query = search.toString();
      return request<SubmissionListItem[]>(`/submissions${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<SubmissionDetail>(`/submissions/${id}`),
    updateStatus: (id: string, status: SubmissionStatus) =>
      request<{ id: string; status: SubmissionStatus }>(`/submissions/${id}`, { method: "PATCH", body: { status } }),
    remove: (id: string) => request<void>(`/submissions/${id}`, { method: "DELETE" }),
  },

  public: {
    getForm: (slug: string) => request<PublicForm>(`/public/forms/${encodeURIComponent(slug)}`, { auth: false }),
    uploadFile: (slug: string, questionId: string, file: File) =>
      request<{ path: string }>(`/public/forms/${encodeURIComponent(slug)}/uploads`, {
        method: "POST",
        file,
        query: { question_id: questionId, file_name: file.name, type: file.type || "application/octet-stream" },
        auth: false,
      }),
    submit: (slug: string, body: { name: string; email: string; answers: Record<string, string>; _hp?: string }) =>
      request<{ ok: true }>(`/public/forms/${encodeURIComponent(slug)}/submissions`, {
        method: "POST",
        body,
        auth: false,
      }),
  },
};
