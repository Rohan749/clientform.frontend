import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { publicFormPrefix } from "@/lib/links";
import { isDefaultTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Branding, FormDraft } from "@/types";
import { BrowserFrame } from "./BrowserFrame";
import { FormRenderer } from "./FormRenderer";

type Device = "desktop" | "mobile";

const DEVICES: Array<{ value: Device; label: string; icon: typeof Monitor }> = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

/**
 * Full client-facing preview (form + testimonials) in a browser frame. The renderer
 * uses container queries, so the Desktop/Mobile toggle shows the real responsive layout.
 * `pro` decides whether the design is shown, exactly like on the live form.
 */
export function FormPreview({
  draft,
  branding,
  slug,
  pro,
  className,
}: {
  draft: FormDraft;
  branding: Branding;
  slug: string | null;
  pro: boolean;
  className?: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className={cn("flex h-full min-h-0 flex-col items-center px-3 pt-4 pb-4 sm:px-6 sm:pb-6", className)}>
      <div className="mb-4 inline-flex rounded-lg bg-muted p-1" role="tablist" aria-label="Preview device">
        {DEVICES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={device === value}
            onClick={() => setDevice(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
              device === value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <BrowserFrame
        url={`${publicFormPrefix()}${slug ?? "your-form"}`}
        className={cn(
          "h-[75dvh] min-h-0 w-full transition-[max-width] duration-300 ease-out lg:h-auto lg:flex-1",
          device === "mobile" ? "max-w-[390px]" : "max-w-6xl",
        )}
      >
        <FormRenderer
          mode="preview"
          title={draft.title}
          description={draft.description}
          questions={draft.questions}
          testimonials={draft.testimonials}
          testimonialsHeading={draft.testimonials_heading}
          testimonialsDescription={draft.testimonials_description}
          branding={branding}
          theme={pro && !isDefaultTheme(draft.theme) ? draft.theme : null}
          showBadge={!(pro && draft.theme.white_label)}
        />
      </BrowserFrame>
    </div>
  );
}
