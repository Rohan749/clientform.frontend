import { type ReactNode, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const RESIZER_SRC = "https://testimonial.to/js/iframeResizer.min.js";
const LOAD_TIMEOUT_MS = 12_000;

type IFrameResize = (options: { log: boolean; checkOrigin: boolean }, target: HTMLIFrameElement) => unknown;
type ResizableIframe = HTMLIFrameElement & { iFrameResizer?: { removeListeners?: () => void } };

let resizerPromise: Promise<IFrameResize> | null = null;

/** Loads Testimonial.to's iframe-resizer (the same one their embed code uses) once. */
function loadResizer(): Promise<IFrameResize> {
  const existing = (window as unknown as { iFrameResize?: IFrameResize }).iFrameResize;
  if (existing) return Promise.resolve(existing);
  if (resizerPromise) return resizerPromise;
  resizerPromise = new Promise<IFrameResize>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RESIZER_SRC;
    script.async = true;
    script.onload = () => {
      const fn = (window as unknown as { iFrameResize?: IFrameResize }).iFrameResize;
      if (fn) resolve(fn);
      else reject(new Error("iFrameResize unavailable"));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Failed to load Testimonial.to resizer"));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    resizerPromise = null;
    throw error;
  });
  return resizerPromise;
}

/**
 * A Testimonial.to embed (wall of love, carousel, single testimonial). The iframe grows to fit
 * its content via iframe-resizer; if that script is blocked it keeps a sensible fixed height.
 */
export function TestimonialToEmbed({ src, fallback }: { src: string; fallback: ReactNode }) {
  const iframeRef = useRef<ResizableIframe>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    setState("loading");
    const timer = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;
    loadResizer()
      .then((iFrameResize) => {
        if (!cancelled) iFrameResize({ log: false, checkOrigin: false }, iframe);
      })
      .catch(() => undefined); // Without the resizer the iframe simply keeps its min height.
    return () => {
      cancelled = true;
      iframe.iFrameResizer?.removeListeners?.();
    };
  }, [src]);

  if (state === "failed") return <>{fallback}</>;

  return (
    <div className="relative w-full">
      {state === "loading" && <Skeleton className="absolute inset-0 rounded-2xl" />}
      <iframe
        ref={iframeRef}
        src={src}
        title="Testimonials from Testimonial.to"
        className="block min-h-[420px] w-full border-0"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
        allow="encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setState("ready")}
      />
    </div>
  );
}
