import type { Testimonial, TestimonialProvider } from "@/types";

// Parsing mirrors backend/src/services/testimonial-providers. Embeds are built only from
// IDs/paths validated here — never from raw user input or pasted embed code.

function parse(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

const X_HOSTS = new Set(["x.com", "www.x.com", "mobile.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"]);
const X_STATUS_PATH = /^\/(?:[A-Za-z0-9_]{1,15}|i\/web)\/status(?:es)?\/(\d{1,25})/;

/** X post id for status URLs, or null. */
export function getXPostId(raw: string): string | null {
  const url = parse(raw);
  if (!url || !X_HOSTS.has(url.hostname.toLowerCase())) return null;
  return X_STATUS_PATH.exec(url.pathname)?.[1] ?? null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Senja widget id from https://widget.senja.io/widget/<uuid>, or null. */
export function getSenjaWidgetId(raw: string): string | null {
  const url = parse(raw);
  if (!url || url.hostname.toLowerCase() !== "widget.senja.io") return null;
  const id = /^\/widget\/([^/]+)/.exec(url.pathname)?.[1];
  return id && UUID.test(id) ? id : null;
}

const TESTIMONIAL_TO_HOSTS = new Set(["embed-v2.testimonial.to", "embed.testimonial.to"]);
const SAFE_PATH = /^\/[A-Za-z0-9._~/-]{1,200}$/;

/** Safe iframe src for a stored Testimonial.to embed URL, or null. */
export function getTestimonialToSrc(raw: string): string | null {
  const url = parse(raw);
  if (!url || url.protocol !== "https:" || !TESTIMONIAL_TO_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (!SAFE_PATH.test(url.pathname) || url.pathname.includes("..")) return null;
  return url.toString();
}

export type EmbedInfo =
  | { kind: "x"; postId: string }
  | { kind: "senja"; widgetId: string }
  | { kind: "testimonial_to"; src: string };

/** How a testimonial should be embedded, or null to show the fallback card. */
export function getEmbed(testimonial: Pick<Testimonial, "provider" | "url">): EmbedInfo | null {
  switch (testimonial.provider) {
    case "x": {
      const postId = getXPostId(testimonial.url);
      return postId ? { kind: "x", postId } : null;
    }
    case "senja": {
      const widgetId = getSenjaWidgetId(testimonial.url);
      return widgetId ? { kind: "senja", widgetId } : null;
    }
    case "testimonial_to": {
      const src = getTestimonialToSrc(testimonial.url);
      return src ? { kind: "testimonial_to", src } : null;
    }
    default:
      return null;
  }
}

export const PROVIDER_LABELS: Record<TestimonialProvider, string> = {
  x: "X",
  senja: "Senja",
  testimonial_to: "Testimonial.to",
};

export function platformLabel(testimonial: Pick<Testimonial, "provider">): string {
  return PROVIDER_LABELS[testimonial.provider] ?? "Testimonial";
}

export function isValidHttpUrl(value: string) {
  const url = parse(value.trim());
  return Boolean(url && (url.protocol === "https:" || url.protocol === "http:"));
}

export function authorLine(t: Pick<Testimonial, "author_name" | "author_handle">) {
  return {
    name: t.author_name || (t.author_handle ? `@${t.author_handle}` : null),
    handle: t.author_name && t.author_handle ? `@${t.author_handle}` : null,
  };
}
