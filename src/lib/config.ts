/**
 * Normalizes the backend URL from VITE_API_URL.
 *
 * A value without a protocol (e.g. "api.example.com") would otherwise be treated by the browser
 * as a path on the frontend's own site ("https://frontend.app/api.example.com/..."), so we add
 * https:// (or http:// for localhost). Trailing slashes and a mistaken trailing "/api" are removed.
 */
function normalizeApiUrl(raw: string | undefined): string {
  let value = (raw ?? "").trim();
  if (!value) return "";

  if (!/^https?:\/\//i.test(value)) {
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(value);
    value = `${isLocal ? "http" : "https"}://${value.replace(/^\/+/, "")}`;
    console.warn(`VITE_API_URL has no protocol; using "${value}". Set the full URL including https:// to silence this.`);
  }

  return value.replace(/\/+$/, "").replace(/\/api$/i, "");
}

/** Backend origin, e.g. "https://api.example.com". Empty in development (Vite proxies /api). */
export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);
