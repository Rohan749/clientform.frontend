import { ArrowRight, Lock, Settings2 } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { initials } from "@/lib/format";
import type { Branding, FormDraft, FormRecord } from "@/types";
import { QuestionList } from "./QuestionList";
import { ShareLink } from "./ShareLink";
import { TestimonialManager } from "./TestimonialManager";

interface FormBuilderProps {
  draft: FormDraft;
  meta: FormRecord | null;
  branding: Branding;
  onChange: (patch: Partial<FormDraft>) => void;
  onChangeSlug: (slug: string) => Promise<void>;
  pro: boolean;
  onRequirePro: () => void;
}

function LockedField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[15px] font-medium">
        {label} <span className="text-muted-foreground">*</span>
      </p>
      <div className="flex h-11 items-center justify-between rounded-lg border bg-neutral-50/70 px-3 text-sm text-muted-foreground/60">
        {placeholder}
        <Lock className="size-3.5" />
      </div>
    </div>
  );
}

/** Document-style form editor: what you type is what clients see. */
export function FormBuilder({ draft, meta, branding, onChange, onChangeSlug, pro, onRequirePro }: FormBuilderProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16 sm:px-8 lg:pt-10">
      {meta?.status === "published" && meta.slug && (
        <div className="mb-10 rounded-2xl border bg-background p-4 shadow-xs animate-in fade-in-0">
          <p className="mb-2.5 text-xs text-muted-foreground">Live link · changes go live when you save</p>
          <ShareLink slug={meta.slug} onChangeSlug={onChangeSlug} />
        </div>
      )}

      {/* Branding (edited in Settings) */}
      <div className="group/brand flex items-center gap-3">
        <Avatar className="size-10 border">
          {branding.avatar_url && <AvatarImage src={branding.avatar_url} alt="" />}
          <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
            {initials(branding.name)}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold">{branding.name}</p>
        <Link
          to="/settings"
          className="ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover/brand:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
        >
          <Settings2 className="size-3" /> Edit branding
        </Link>
      </div>

      {/* Title & description, edited inline */}
      <AutoTextarea
        value={draft.title}
        maxLength={200}
        placeholder="Form title"
        aria-label="Form title"
        onChange={(e) => onChange({ title: e.target.value.replace(/\n/g, " ") })}
        className="mt-10 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
      />
      <AutoTextarea
        value={draft.description}
        maxLength={2000}
        placeholder="Add a description — tell clients what to expect"
        aria-label="Form description"
        onChange={(e) => onChange({ description: e.target.value })}
        className="mt-3 text-[15px] leading-relaxed text-muted-foreground"
      />

      {/* Always-collected contact fields */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-4">
        <LockedField label="Your name" placeholder="Jane Cooper" />
        <LockedField label="Email" placeholder="jane@company.com" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Name and email are always asked, so you can reply.</p>

      <div className="mt-8">
        <QuestionList
          questions={draft.questions}
          onChange={(questions) => onChange({ questions })}
          formType={draft.form_type}
          pro={pro}
          onRequirePro={onRequirePro}
        />
      </div>

      <div className="mt-6">
        <span className="inline-flex h-12 cursor-default items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-medium text-primary-foreground opacity-90 select-none">
          Send project request <ArrowRight className="size-4" />
        </span>
      </div>

      {/* Testimonials */}
      <section className="mt-16 border-t pt-10">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Reviews next to your form</p>
        <p className="mt-2 text-sm text-muted-foreground">
          These sit beside the questions and scroll gently when there are many. Leave the title or subtitle empty to hide it.
        </p>
        <div className="mt-5 space-y-3 rounded-2xl border bg-neutral-50/60 p-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Title</span>
            <AutoTextarea
              value={draft.testimonials_heading}
              maxLength={120}
              placeholder="What clients say"
              aria-label="Testimonials title"
              onChange={(e) => onChange({ testimonials_heading: e.target.value.replace(/\n/g, " ") })}
              className="mt-0.5 text-xl font-semibold tracking-tight"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Subtitle</span>
            <AutoTextarea
              value={draft.testimonials_description}
              maxLength={300}
              placeholder="A few words from people I've worked with."
              aria-label="Testimonials subtitle"
              onChange={(e) => onChange({ testimonials_description: e.target.value.replace(/\n/g, " ") })}
              className="mt-0.5 text-sm leading-relaxed text-muted-foreground"
            />
          </label>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Show proof from happy clients: X posts, Senja widgets and Testimonial.to walls of love.
        </p>
        <div className="mt-6">
          <TestimonialManager
            testimonials={draft.testimonials}
            onChange={(testimonials) => onChange({ testimonials })}
          />
        </div>
      </section>
    </div>
  );
}
