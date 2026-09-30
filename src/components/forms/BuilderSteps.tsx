import { ArrowLeft, ArrowRight, Check, Code2, Crown, FileText, Files, Loader2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDefaultTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { FormDraft, FormRecord, FormType } from "@/types";
import { ShareLink } from "./ShareLink";

export type BuilderStep = "type" | "questions" | "design" | "preview";

export const BUILDER_STEPS: Array<{ id: BuilderStep; label: string; title: string; hint: string }> = [
  { id: "type", label: "Form type", title: "What kind of form do you want?", hint: "You can change this later." },
  { id: "questions", label: "Questions", title: "Add your questions", hint: "Name and email are always asked. Add anything else you need, and your reviews." },
  { id: "design", label: "Customize", title: "Make it look like your brand", hint: "Pick a look, then fine-tune it. The preview updates as you go." },
  { id: "preview", label: "Preview", title: "Check it, then publish", hint: "This is exactly what your clients will see." },
];

export const stepIndex = (step: BuilderStep) => BUILDER_STEPS.findIndex((s) => s.id === step);

/** Numbered progress: done steps get a check, the current one is filled, the rest are outlined. */
export function BuilderStepper({ current, onSelect }: { current: BuilderStep; onSelect: (step: BuilderStep) => void }) {
  const currentIndex = stepIndex(current);
  return (
    <nav aria-label="Form building steps" className="overflow-x-auto">
      <ol className="mx-auto flex w-max items-center gap-1.5 px-3 sm:gap-2">
        {BUILDER_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn("h-px w-4 transition-colors duration-300 sm:w-10", index <= currentIndex ? "bg-foreground" : "bg-border")}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active ? "bg-muted text-foreground" : done ? "text-foreground hover:bg-muted/60" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs transition-all duration-300",
                    active && "bg-foreground text-background shadow-sm",
                    done && "bg-foreground/90 text-background",
                    !active && !done && "border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={cn(active ? "inline" : "hidden md:inline")}>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** "Step 2 of 4 · Add your questions" above each stage. */
export function StepIntro({ step, className, children }: { step: BuilderStep; className?: string; children?: ReactNode }) {
  const index = stepIndex(step);
  const meta = BUILDER_STEPS[index];
  return (
    <div className={cn("animate-in fade-in-0 slide-in-from-bottom-1 duration-300", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Step {index + 1} of {BUILDER_STEPS.length}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{meta?.title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{meta?.hint}</p>
      {children}
    </div>
  );
}

/** Sticky Back / Continue bar under every stage. */
export function StepFooter({
  step,
  onStep,
  primary,
}: {
  step: BuilderStep;
  onStep: (step: BuilderStep) => void;
  /** Replaces "Continue" on the last step (publish / save). */
  primary?: ReactNode;
}) {
  const index = stepIndex(step);
  const prev = BUILDER_STEPS[index - 1];
  const next = BUILDER_STEPS[index + 1];
  return (
    <div className="sticky bottom-0 z-20 shrink-0 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {prev ? (
          <Button variant="ghost" onClick={() => onStep(prev.id)} className="text-muted-foreground">
            <ArrowLeft />
            <span>
              <span className="hidden sm:inline">Back to </span>
              {prev.label}
            </span>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button onClick={() => onStep(next.id)}>
            <span>
              Continue<span className="hidden sm:inline"> to {next.label}</span>
            </span>
            <ArrowRight />
          </Button>
        ) : (
          primary
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: form type
// ---------------------------------------------------------------------------

export function FormTypeStep({
  draft,
  pro,
  onChange,
  onRequirePro,
}: {
  draft: FormDraft;
  pro: boolean;
  onChange: (patch: Partial<FormDraft>) => void;
  onRequirePro: () => void;
}) {
  const choose = (form_type: FormType) => {
    if (form_type === "multi" && !pro) {
      onRequirePro();
      return;
    }
    // A single-page form puts every question back on the first page.
    onChange(form_type === "single" ? { form_type, questions: draft.questions.map((q) => ({ ...q, page: 0 })) } : { form_type });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 sm:px-8 lg:pt-12">
      <StepIntro step="type" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Form type">
        <TypeCard
          selected={draft.form_type === "single"}
          onSelect={() => choose("single")}
          icon={<FileText className="size-5" />}
          title="Single page"
          body="All questions on one page. Best for short forms."
          illustration={<SinglePageArt />}
        />
        <TypeCard
          selected={draft.form_type === "multi"}
          onSelect={() => choose("multi")}
          icon={<Files className="size-5" />}
          title="Multiple pages"
          body="Questions come in small steps. Long forms feel shorter."
          illustration={<MultiPageArt />}
          badge={
            !pro && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                <Crown className="size-3" /> Pro
              </span>
            )
          }
        />
      </div>

      {!pro && draft.form_type === "multi" && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            Pages are paused without Pro, so clients see one page. <Link to="/billing" className="font-medium underline underline-offset-4">Renew Pro</Link> or switch to a single page.
          </span>
        </p>
      )}

      <label className="mt-10 block max-w-md">
        <span className="text-sm font-medium">Name your form</span>
        <span className="ml-2 text-xs text-muted-foreground">Only you see this</span>
        <Input
          value={draft.name}
          maxLength={120}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Project request"
          className="mt-2 h-11"
        />
      </label>
    </div>
  );
}

function TypeCard({
  selected,
  onSelect,
  icon,
  title,
  body,
  illustration,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  body: string;
  illustration: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-background p-5 text-left transition-all outline-none hover:border-foreground/30 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected && "border-foreground shadow-sm ring-1 ring-foreground",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border bg-neutral-50">{icon}</span>
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border transition-colors",
            selected ? "border-foreground bg-foreground text-background" : "bg-background",
          )}
        >
          {selected && <Check className="size-3" />}
        </span>
      </div>
      <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-neutral-50">{illustration}</div>
      <p className="mt-4 flex items-center gap-2 text-[15px] font-semibold">
        {title} {badge}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </button>
  );
}

function Bars({ count }: { count: number }) {
  return (
    <div className="w-full space-y-1.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-2 rounded-full bg-neutral-200" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

function SinglePageArt() {
  return (
    <div className="w-24 rounded-lg border bg-background p-2.5 shadow-xs">
      <Bars count={5} />
      <div className="mt-2.5 h-3 w-10 rounded bg-foreground" />
    </div>
  );
}

function MultiPageArt() {
  return (
    <div className="relative h-20 w-28">
      <div className="absolute top-0 left-6 w-20 rounded-lg border bg-background p-2 opacity-60 shadow-xs">
        <Bars count={2} />
      </div>
      <div className="absolute top-3 left-3 w-20 rounded-lg border bg-background p-2 opacity-80 shadow-xs">
        <Bars count={2} />
      </div>
      <div className="absolute top-6 left-0 w-20 rounded-lg border bg-background p-2 shadow-sm">
        <Bars count={2} />
        <div className="mt-2 flex justify-end">
          <div className="h-2.5 w-7 rounded bg-foreground" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: final check before publishing
// ---------------------------------------------------------------------------

/** What's in the form at a glance, plus anything that would stop publishing. */
export function PublishChecklist({
  draft,
  meta,
  pro,
  onChangeSlug,
  onEmbed,
}: {
  draft: FormDraft;
  meta: FormRecord | null;
  pro: boolean;
  onChangeSlug: (slug: string) => Promise<void>;
  onEmbed: () => void;
}) {
  const unlabeled = draft.questions.findIndex((q) => !q.label.trim());
  const problems = [
    !draft.title.trim() && "Add a form title (step 2).",
    unlabeled !== -1 && `Question ${unlabeled + 1} needs a label (step 2).`,
  ].filter(Boolean) as string[];
  const pausedPro =
    !pro && (draft.form_type === "multi" || draft.questions.some((q) => q.show_if) || !isDefaultTheme(draft.theme));

  const items = [
    { label: draft.form_type === "multi" ? "Multiple pages" : "Single page" },
    { label: `${draft.questions.length + 2} questions`, note: "incl. name and email" },
    { label: draft.testimonials.length ? `${draft.testimonials.length} reviews` : "No reviews yet" },
    { label: isDefaultTheme(draft.theme) ? "Standard look" : "Custom design" },
  ];

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs">
            <Check className="size-3 text-success" />
            {item.label}
            {item.note && <span className="text-muted-foreground">{item.note}</span>}
          </li>
        ))}
      </ul>

      {problems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Before you publish</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      {pausedPro && (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Some Pro features in this form (pages, conditions or design) are paused, so the preview shows the standard version.{" "}
          <Link to="/billing" className="font-medium text-foreground underline underline-offset-4">
            Go Pro
          </Link>{" "}
          to turn them on.
        </p>
      )}

      {meta?.status === "published" && meta.slug && (
        <div className="rounded-2xl border bg-background p-4 shadow-xs">
          <p className="mb-2.5 text-xs text-muted-foreground">Your form is live. Share the link or embed it on your site.</p>
          <ShareLink slug={meta.slug} onChangeSlug={onChangeSlug} />
          <Button variant="outline" size="sm" className="mt-3" onClick={onEmbed}>
            <Code2 /> Get embed code
          </Button>
        </div>
      )}
    </div>
  );
}

/** The publish / save button for the last step. */
export function PublishButton({
  meta,
  dirty,
  busy,
  publishing,
  onPublish,
  onSave,
}: {
  meta: FormRecord | null;
  dirty: boolean;
  busy: boolean;
  publishing: boolean;
  onPublish: () => void;
  onSave: () => void;
}) {
  if (meta?.status === "published") {
    return (
      <Button onClick={onSave} disabled={busy || !dirty}>
        {busy && <Loader2 className="animate-spin" />}
        {dirty ? "Save changes" : (
          <>
            <Check /> Live
          </>
        )}
      </Button>
    );
  }
  return (
    <Button onClick={onPublish} disabled={busy}>
      {publishing && <Loader2 className="animate-spin" />}
      Publish form <ArrowRight />
    </Button>
  );
}
