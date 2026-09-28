import { type ReactNode, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORM_SRC = "https://static.senja.io/dist/platform.js";
const LOAD_TIMEOUT_MS = 12_000;

let platformPromise: Promise<void> | null = null;

/** Loads Senja's official embed script once. It watches the DOM for new `.senja-embed` elements. */
function loadSenjaPlatform(): Promise<void> {
  if (platformPromise) return platformPromise;
  platformPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLATFORM_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = PLATFORM_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Failed to load Senja"));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    platformPromise = null;
    throw error;
  });
  return platformPromise;
}

/**
 * A Senja widget (wall of love, carousel, single testimonial…) rendered with Senja's own
 * script, at its natural height. Falls back if the script is blocked or the widget never builds.
 */
export function SenjaEmbed({ widgetId, fallback }: { widgetId: string; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    setState("loading");

    const isBuilt = () => Boolean(el.shadowRoot || el.childElementCount > 0 || el.hasAttribute("data-built"));

    const observer = new MutationObserver(() => {
      if (!cancelled && isBuilt()) setState("ready");
    });
    observer.observe(el, { attributes: true, childList: true });

    loadSenjaPlatform()
      .then(() => {
        if (!cancelled && isBuilt()) setState("ready");
      })
      .catch(() => !cancelled && setState("failed"));

    const timer = window.setTimeout(() => {
      if (!cancelled) setState((s) => (s === "loading" && !isBuilt() ? "failed" : isBuilt() ? "ready" : s));
    }, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [widgetId]);

  if (state === "failed") return <>{fallback}</>;

  return (
    <div className="w-full">
      {state === "loading" && <Skeleton className="h-48 w-full rounded-2xl" />}
      {/* Senja's platform.js finds this element and renders the widget into it. */}
      <div
        ref={ref}
        key={widgetId}
        className="senja-embed block w-full"
        data-id={widgetId}
        data-mode="shadow"
        data-lazyload="false"
      />
    </div>
  );
}
