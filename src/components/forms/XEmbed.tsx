import { type ReactNode, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const WIDGETS_SRC = "https://platform.twitter.com/widgets.js";
const EMBED_TIMEOUT_MS = 10_000;

let widgetsPromise: Promise<TwitterWidgets> | null = null;

function loadWidgets(): Promise<TwitterWidgets> {
  if (window.twttr?.widgets) return Promise.resolve(window.twttr.widgets);
  if (widgetsPromise) return widgetsPromise;

  widgetsPromise = new Promise<TwitterWidgets>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGETS_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.onload = () => {
      if (window.twttr?.widgets) resolve(window.twttr.widgets);
      else reject(new Error("X widgets unavailable"));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Failed to load X widgets"));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    widgetsPromise = null; // allow a retry on the next mount
    throw error;
  });

  return widgetsPromise;
}

type EmbedState = "loading" | "ready" | "failed";

/**
 * Renders an X post using the official embed. Blocked scripts, deleted posts,
 * privacy extensions and timeouts all degrade to the provided fallback.
 */
export function XEmbed({ postId, fallback }: { postId: string; fallback: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EmbedState>("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setState("loading");
    container.replaceChildren();

    const timeout = window.setTimeout(() => {
      if (!cancelled) setState((current) => (current === "loading" ? "failed" : current));
    }, EMBED_TIMEOUT_MS);

    loadWidgets()
      .then((widgets) => widgets.createTweet(postId, container, { dnt: true, conversation: "none", align: "center" }))
      .then((element) => {
        if (cancelled) {
          element?.remove();
          return;
        }
        setState(element ? "ready" : "failed");
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      container.replaceChildren();
    };
  }, [postId]);

  return (
    <div className="w-full">
      {state === "loading" && (
        <div className="rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      )}
      {state === "failed" && fallback}
      <div
        ref={containerRef}
        className={
          state === "failed"
            ? "hidden"
            : // zoom scales X's iframe (and its text) down; its internals can't be styled directly.
              "[zoom:0.82] [&_.twitter-tweet]:!my-0 [&_.twitter-tweet]:!mx-auto" +
              (state === "loading" ? " h-0 overflow-hidden" : "")
        }
      />
    </div>
  );
}
