import { ArrowRight, ArrowUpRight, Check, FileText, Loader2, RotateCw, Upload, X } from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import { ApiError, errorMessage } from "@/lib/api";
import { formatBytes, hostname, initials } from "@/lib/format";
import { QUESTION_TYPE_META } from "@/lib/questions";
import { customCssProblem, fontById, googleFontsHref, scopeCss, themeStyle } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Branding, FormTheme, Question, Testimonial } from "@/types";
import { TestimonialWall } from "./TestimonialWall";

export interface SubmissionValues {
  name: string;
  email: string;
  answers: Record<string, string>;
  _hp?: string;
}

interface FormRendererProps {
  title: string;
  description: string;
  questions: Question[];
  testimonials: Testimonial[];
  /** Heading above the testimonials; empty hides it. */
  testimonialsHeading?: string;
  /** Short line under the heading; empty hides it. */
  testimonialsDescription?: string;
  branding: Branding;
  /**
   * preview — inside the builder / marketing page; submitting is disabled.
   * live    — the published public form.
   */
  mode: "preview" | "live";
  /** Load real X embeds (disable for static marketing samples). */
  embedTestimonials?: boolean;
  /** Pro design; null/undefined renders the standard ClientForm look. */
  theme?: FormTheme | null;
  /** The floating "Powered by ClientForm" badge (hidden only by Pro white labeling). */
  showBadge?: boolean;
  onSubmit?: (values: SubmissionValues) => Promise<void>;
  /** Uploads a file for a question and resolves to its storage path. */
  onUpload?: (questionId: string, file: File) => Promise<string>;
}

type FileState = { name: string; size: number; status: "uploading" | "done" | "error"; error?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function FormRenderer({
  title,
  description,
  questions,
  testimonials,
  testimonialsHeading = "",
  testimonialsDescription = "",
  branding,
  mode,
  embedTestimonials = true,
  theme = null,
  showBadge = true,
  onSubmit,
  onUpload,
}: FormRendererProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, FileState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isPreview = mode === "preview";
  const hasTestimonials = testimonials.length > 0;
  const brandName = branding.name?.trim() || null;

  const themed = useMemo(() => {
    if (!theme) return null;
    const { style, customColors } = themeStyle(theme);
    const css = theme.custom_css.trim() && !customCssProblem(theme.custom_css) ? scopeCss(theme.custom_css) : "";
    return { style, customColors, css };
  }, [theme]);
  useGoogleFonts(theme ? googleFontsHref([fontById(theme.font)]) : null);

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(({ [id]: _removed, ...rest }) => rest);
  };

  const handleFile = async (question: Question, file: File | null) => {
    if (!file) {
      setFiles(({ [question.id]: _removed, ...rest }) => rest);
      setAnswer(question.id, "");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((prev) => ({ ...prev, [question.id]: "Files must be 10 MB or smaller" }));
      return;
    }
    if (isPreview || !onUpload) {
      setFiles((prev) => ({ ...prev, [question.id]: { name: file.name, size: file.size, status: "done" } }));
      return;
    }

    setFiles((prev) => ({ ...prev, [question.id]: { name: file.name, size: file.size, status: "uploading" } }));
    try {
      const path = await onUpload(question.id, file);
      setFiles((prev) => ({ ...prev, [question.id]: { name: file.name, size: file.size, status: "done" } }));
      setAnswer(question.id, path);
    } catch (error) {
      setFiles((prev) => ({
        ...prev,
        [question.id]: { name: file.name, size: file.size, status: "error", error: errorMessage(error) },
      }));
      setAnswer(question.id, "");
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name";
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Please enter a valid email";

    for (const question of questions) {
      const value = (answers[question.id] ?? "").trim();
      if (question.type === "file" && files[question.id]?.status === "uploading") {
        next[question.id] = "Please wait for the upload to finish";
      } else if (!value) {
        if (question.required) next[question.id] = "This question is required";
      } else if (question.type === "email" && !EMAIL_PATTERN.test(value)) {
        next[question.id] = "Please enter a valid email";
      }
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isPreview || !onSubmit) {
      toast("This is a preview", { description: "Publish your form to start receiving requests." });
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`cf-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), answers, _hp: honeypot || undefined });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiError && error.fields) setErrors(error.fields);
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Full-height column: the page always fills the screen (or the preview frame), so short
    // states like the thank-you message don't leave the page half empty.
    <>
    <div
      className={cn(
        "cf-root @container flex w-full flex-col bg-neutral-50 text-foreground",
        isPreview ? "min-h-full" : "min-h-dvh",
      )}
      style={themed?.style}
      data-cf-colors={themed?.customColors ? "" : undefined}
    >
      {/* The owner's custom CSS, scoped to this form (validated on save and again here). */}
      {themed?.css ? <style>{themed.css}</style> : null}
      <div
        className={cn(
          "cf-page mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 @md:px-6 @md:py-8 @5xl:py-14",
          // Room for the floating badge so it never covers the send button at the very end.
          showBadge && "pb-20 @md:pb-20 @5xl:pb-20",
        )}
      >
        <div
          className={cn(
            "grid flex-1 gap-4 @md:gap-6",
            hasTestimonials && "@4xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
          )}
        >
          {/* Left: the form */}
          <div className="cf-card flex min-w-0 flex-col rounded-2xl   p-6 shadow-xs @2xl:p-10">
            <BrandHeader branding={branding} />
            <div className="mt-8 flex flex-1 flex-col">
            {submitted ? (
              <SuccessState name={name} email={email} brandName={brandName} />
            ) : (
              <>
                <header className="cf-header">
                  {/* Near-black title that fades into purple → pink at the very end.
                      w-fit keeps the gradient the width of the text, not the whole column. */}
                  <h1 className="cf-title w-fit max-w-full bg-linear-to-r from-neutral-950 from-55% via-violet-700 via-85% to-pink-500 bg-clip-text pb-1 text-3xl font-semibold tracking-tight text-balance wrap-anywhere text-transparent @2xl:text-4xl">
                    {title.trim() || "Untitled form"}
                  </h1>
                  {description.trim() && (
                    <p className="cf-description mt-3 max-w-xl text-[15px] leading-relaxed whitespace-pre-line wrap-anywhere text-muted-foreground">
                      {description}
                    </p>
                  )}
                </header>

                <form className="cf-form mt-10 space-y-7" onSubmit={handleSubmit} noValidate>
                  {/* Honeypot: hidden from people, tempting for bots */}
                  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Leave this field empty
                      <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    </label>
                  </div>

                  <div className="grid gap-7 @lg:grid-cols-2 @lg:gap-4">
                    <Field id="name" label="Your name" required error={errors.name}>
                      <Input
                        id="cf-name"
                        autoComplete="name"
                        placeholder="Jane Cooper"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(({ name: _n, ...rest }) => rest);
                        }}
                        aria-invalid={Boolean(errors.name)}
                        className="cf-input h-11"
                      />
                    </Field>
                    <Field id="email" label="Email" required error={errors.email}>
                      <Input
                        id="cf-email"
                        type="email"
                        autoComplete="email"
                        placeholder="jane@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(({ email: _e, ...rest }) => rest);
                        }}
                        aria-invalid={Boolean(errors.email)}
                        className="cf-input h-11"
                      />
                    </Field>
                  </div>

                  {questions.map((question) => (
                    <Field
                      key={question.id}
                      id={question.id}
                      label={question.label.trim() || QUESTION_TYPE_META[question.type].label}
                      required={question.required}
                      error={errors[question.id]}
                    >
                      <QuestionInput
                        question={question}
                        value={answers[question.id] ?? ""}
                        file={files[question.id]}
                        invalid={Boolean(errors[question.id])}
                        onChange={(value) => setAnswer(question.id, value)}
                        onFile={(file) => handleFile(question, file)}
                      />
                    </Field>
                  ))}

                  <div className="pt-2">
                    <Button type="submit" size="lg" className="cf-submit h-12 w-full text-[15px] @lg:w-auto" disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" /> : null}
                      Send project request
                      {!submitting && <ArrowRight />}
                    </Button>
                    <p className="cf-note mt-3 text-xs text-muted-foreground">
                      Your answers are only shared with {brandName ?? "the form owner"}.
                    </p>
                  </div>
                </form>
              </>
            )}
            </div>
          </div>

          {/* Right: testimonials — as tall as the form, overflow scrolls in a loop */}
          {hasTestimonials && (
            <aside aria-label={testimonialsHeading.trim() || "Testimonials"} className="relative min-w-0 @4xl:min-h-[480px]">
              
              <TestimonialWall
                testimonials={testimonials}
                heading={testimonialsHeading}
                description={testimonialsDescription}
                embed={embedTestimonials}
                className="h-[560px] @4xl:absolute @4xl:inset-0 @4xl:h-auto"
              />
            </aside>
          )}
        </div>

      </div>
    </div>
    {showBadge && <FormBadge floating={isPreview ? "sticky" : "fixed"} />}
    </>
  );
}

/**
 * The ClientForm badge, floating in the bottom-right corner while the client scrolls.
 * It sits outside the themed root, so a form's colors and fonts never restyle it.
 * In the builder preview it sticks to the preview frame instead of the browser window.
 */
function FormBadge({ floating }: { floating: "fixed" | "sticky" }) {
  const badge = (
    <a
      href="/"
      target="_blank"
      rel="noopener"
      className="cf-badge pointer-events-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/95 py-1.5 pr-3.5 pl-2 font-sans text-neutral-950 shadow-lg shadow-black/[0.08] backdrop-blur-sm transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
    >
      <LogoMark className="size-6" />
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-xs text-neutral-500">Powered by</span>
        <span className="text-[15px] font-semibold tracking-tight">ClientForm</span>
      </span>
    </a>
  );

  if (floating === "fixed") {
    return (
      <div className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 sm:right-5 sm:bottom-5">
        {badge}
      </div>
    );
  }

  // Zero-height sticky row at the end of the scroll area, pinned to the frame's bottom edge;
  // items-end lets the badge rise above it instead of being squashed to zero height.
  return (
    <div className="pointer-events-none sticky bottom-0 z-10 flex h-0 items-end justify-end">
      <div className="pr-4 pb-4">{badge}</div>
    </div>
  );
}

function BrandHeader({ branding }: { branding: Branding }) {
  const site = hostname(branding.website_url);
  if (!branding.name && !branding.avatar_url) return null;

  return (
    <div className="cf-brand flex items-center gap-3">
      <Avatar className="size-16 border">
        {branding.avatar_url && <AvatarImage src={branding.avatar_url} alt="" />}
        <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
          {initials(branding.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {branding.name && <p className="cf-brand-name truncate text-xl font-semibold">{branding.name}</p>}
        {site && branding.website_url && (
          <a
            href={branding.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {site} <ArrowUpRight className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="cf-field space-y-2.5">
      <label htmlFor={`cf-${id}`} className="cf-label block text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-muted-foreground" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional</span>
        )}
      </label>
      {children}
      {error && (
        <p className="cf-error text-xs font-medium text-destructive animate-in fade-in-0 slide-in-from-top-0.5">{error}</p>
      )}
    </div>
  );
}

function QuestionInput({
  question,
  value,
  file,
  invalid,
  onChange,
  onFile,
}: {
  question: Question;
  value: string;
  file?: FileState;
  invalid: boolean;
  onChange: (value: string) => void;
  onFile: (file: File | null) => void;
}) {
  const id = `cf-${question.id}`;
  const common = { id, "aria-invalid": invalid, placeholder: question.placeholder || undefined };

  switch (question.type) {
    case "long_text":
      return <Textarea {...common} rows={5} value={value} onChange={(e) => onChange(e.target.value)} className="cf-input min-h-32" />;
    case "email":
      return <Input {...common} type="email" value={value} onChange={(e) => onChange(e.target.value)} className="cf-input h-11" />;
    case "url":
      return (
        <Input {...common} type="url" inputMode="url" value={value} onChange={(e) => onChange(e.target.value)} className="cf-input h-11" />
      );
    case "multiple_choice":
    case "budget":
      return <ChoiceGroup id={id} options={question.options} value={value} onChange={onChange} required={question.required} />;
    case "file":
      return <FileInput id={id} hint={question.placeholder} file={file} onFile={onFile} />;
    case "short_text":
    default:
      return <Input {...common} value={value} onChange={(e) => onChange(e.target.value)} className="cf-input h-11" />;
  }
}

function ChoiceGroup({
  id,
  options,
  value,
  onChange,
  required,
}: {
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}) {
  if (options.length === 0) {
    return <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">No options yet</p>;
  }

  return (
    <div id={id} role="radiogroup" tabIndex={-1} className="cf-choices grid gap-2 outline-none @md:grid-cols-2">
      {options.map((option, index) => {
        const selected = value === option;
        return (
          <button
            key={`${option}-${index}`}
            type="button"
            role="radio"
            aria-checked={selected}
            data-selected={selected ? "" : undefined}
            onClick={() => onChange(selected && !required ? "" : option)}
            className={cn(
              "cf-choice flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
              selected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "bg-background hover:border-foreground/25 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected ? "border-primary-foreground" : "border-foreground/25",
              )}
            >
              {selected && <span className="size-1.5 rounded-full bg-primary-foreground" />}
            </span>
            <span className="min-w-0 break-words">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function FileInput({
  id,
  hint,
  file,
  onFile,
}: {
  id: string;
  hint: string;
  file?: FileState;
  onFile: (file: File | null) => void;
}) {
  if (file) {
    return (
      <div className="cf-upload flex items-center gap-3 rounded-xl border px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className={cn("text-xs", file.status === "error" ? "text-destructive" : "text-muted-foreground")}>
            {file.status === "uploading" && "Uploading…"}
            {file.status === "done" && formatBytes(file.size)}
            {file.status === "error" && (file.error ?? "Upload failed")}
          </p>
        </div>
        {file.status === "uploading" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {file.status === "done" && <Check className="size-4 text-success" />}
        {file.status === "error" && (
          <label htmlFor={id} className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <RotateCw className="size-4" />
            <span className="sr-only">Try again</span>
          </label>
        )}
        <button
          type="button"
          onClick={() => onFile(null)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Remove file"
        >
          <X className="size-4" />
        </button>
        <input id={id} type="file" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="cf-upload flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors hover:border-foreground/25 hover:bg-muted/40 focus-within:ring-[3px] focus-within:ring-ring/30"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background shadow-xs">
        <Upload className="size-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">Click to upload</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function SuccessState({ name, email, brandName }: { name: string; email: string; brandName: string | null }) {
  const firstName = name.trim().split(/\s+/)[0];
  return (
    // Centred vertically in the card, which stretches to fill the screen.
    <div className="cf-success flex flex-1 flex-col justify-center py-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-5" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight wrap-anywhere @2xl:text-4xl">
        Thanks{firstName ? `, ${firstName}` : ""}. Your request is in.
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {brandName ?? "The team"} will review your project and get back to you at{" "}
        <span className="font-medium break-all text-foreground">{email}</span>.
      </p>
    </div>
  );
}
