import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string, message = "Link copied") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy — please copy the link manually");
    }
  }, []);

  return { copy, copied };
}
