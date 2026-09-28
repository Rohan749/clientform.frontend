import { supabase } from "./supabase";
import type {
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

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

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
  auth?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new ApiError(401, "Your session has expired. Please log in again.");
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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

export const api = {
  dashboard: () => request<DashboardData>("/dashboard"),

  profile: {
    get: () => request<Profile>("/profile"),
    update: (patch: Partial<Pick<Profile, "name" | "display_name" | "website_url" | "avatar_url">>) =>
      request<Profile>("/profile", { method: "PATCH", body: patch }),
  },

  forms: {
    list: () => request<FormSummary[]>("/forms"),
    get: (id: string) => request<FormWithContent>(`/forms/${id}`),
    create: (draft: FormDraft) => request<FormWithContent>("/forms", { method: "POST", body: draft }),
    update: (id: string, patch: Partial<FormDraft> & { status?: "draft" | "archived" }) =>
      request<FormWithContent>(`/forms/${id}`, { method: "PATCH", body: patch }),
    remove: (id: string) => request<void>(`/forms/${id}`, { method: "DELETE" }),
    publish: (id: string, slug?: string) =>
      request<FormWithContent>(`/forms/${id}/publish`, { method: "POST", body: slug ? { slug } : {} }),
    unpublish: (id: string) => request<FormWithContent>(`/forms/${id}/unpublish`, { method: "POST" }),
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
    createUpload: (slug: string, body: { question_id: string; file_name: string; file_size: number }) =>
      request<{ path: string; token: string }>(`/public/forms/${encodeURIComponent(slug)}/uploads`, {
        method: "POST",
        body,
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
