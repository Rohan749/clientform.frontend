import { useEffect } from "react";

/** Adds a Google Fonts stylesheet to the page once (kept for the session; fonts are cached). */
export function useGoogleFonts(href: string | null) {
  useEffect(() => {
    if (!href) return;
    if (document.head.querySelector(`link[data-cf-fonts="${CSS.escape(href)}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.cfFonts = href;
    document.head.appendChild(link);
  }, [href]);
}
