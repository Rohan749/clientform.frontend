const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

export function appOrigin() {
  return PUBLIC_APP_URL || window.location.origin;
}

export function publicFormUrl(slug: string) {
  return `${appOrigin()}/f/${slug}`;
}

/** URL without the protocol, for display (e.g. "clientform.com/f/rohan-motion-design"). */
export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export function publicFormPrefix() {
  return `${displayUrl(appOrigin())}/f/`;
}
