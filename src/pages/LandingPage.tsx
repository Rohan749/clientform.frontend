import {
  ArrowDown,
  ArrowRight,
  Check,
  Eye,
  FileText,
  Link2,
  MessageSquareQuote,
  MousePointerClick,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "@/components/common/Logo";
import { BrowserFrame } from "@/components/forms/BrowserFrame";
import { ProviderIcon } from "@/components/forms/TestimonialCard";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MiniForm } from "@/components/marketing/MiniForm";
import { ProofPanel } from "@/components/marketing/ProofPanel";
import { Reveal } from "@/components/marketing/Reveal";
import { SampleTestimonialCard } from "@/components/marketing/SampleTestimonialCard";
import { SAMPLE_TESTIMONIALS } from "@/components/marketing/samples";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TestimonialProvider } from "@/types";

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const JOURNEY: Array<{ icon: typeof Search; text: string }> = [
  { icon: Search, text: "They find your work." },
  { icon: ThumbsUp, text: "They like what they see." },
  { icon: MousePointerClick, text: "They click “Work with me.”" },
  { icon: FileText, text: "They land on a generic form." },
];

const STEPS = [
  { title: "Create your project form", body: "Build the questions you need from your clients." },
  { title: "Add your best testimonials", body: "Bring in testimonials from X, Senja and Testimonial.to." },
  { title: "Share your ClientForm link", body: "Send one clean project request link to potential clients." },
  { title: "Let the form build trust", body: "Clients see your proof while they tell you about their project." },
];

const SOURCES: Array<{ id: TestimonialProvider; name: string; paste: string }> = [
  { id: "x", name: "X", paste: "Paste a link to a post where a client praised your work." },
  { id: "senja", name: "Senja", paste: "Paste your Senja widget link or embed code." },
  { id: "testimonial_to", name: "Testimonial.to", paste: "Paste your Wall of Love embed code or link." },
];

const AUDIENCE = [
  "Motion designers",
  "Graphic designers",
  "Product designers",
  "Web designers",
  "Freelancers",
  "Creative studios",
  "Agencies",
];

const INCLUDED = [
  "Unlimited project forms",
  "Testimonials from X, Senja and Testimonial.to",
  "File uploads up to 10 MB",
  "Your own shareable link",
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-muted-foreground">{children}</p>;
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl", className)}>{children}</h2>
  );
}

/** The same near-black → violet → pink gradient ClientForm uses for form titles. */
function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="bg-linear-to-r from-neutral-950 via-violet-700 to-pink-500 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function ExampleNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      Example form. Studio and testimonials shown are samples.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dotted [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-14 text-center sm:px-8 sm:pt-28">
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-success" />
            For freelancers, designers & creative studios
          </span>
          <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl sm:leading-[1.05]">
            Your client form should <Accent>build trust, too.</Accent>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
            Potential clients are already interested in your work. Don't lose them at the form. ClientForm shows your
            best client testimonials while they fill out your project request.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/signup">
                Create your form <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-20 sm:px-8 animate-in fade-in-0 slide-in-from-bottom-4 delay-150 duration-1000 fill-mode-backwards">
        <div className="relative mx-auto max-w-5xl">
          <div className="pointer-events-none absolute -inset-x-10 -inset-y-10 -z-10 rounded-[40px] bg-dotted opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <BrowserFrame url="clientform.com/f/juno-studio" className="shadow-2xl shadow-black/[0.07]">
            <div className="grid gap-4 bg-neutral-50 p-3 sm:p-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MiniForm />
              <div className="relative h-[420px] md:h-auto">
                <ProofPanel testimonials={SAMPLE_TESTIMONIALS} moving className="absolute inset-0" />
              </div>
            </div>
          </BrowserFrame>

          {/* Callouts that name the two halves of the product */}
          <div className="absolute top-1/2 -left-3 hidden -translate-x-full -translate-y-1/2 lg:block">
            <Callout label="Your project questions" align="right" />
          </div>
          <div className="absolute top-1/3 -right-3 hidden translate-x-full lg:block">
            <Callout label="Proof from past clients" align="left" />
          </div>
        </div>
        <ExampleNote className="mt-6" />
      </div>
    </section>
  );
}

function Callout({ label, align }: { label: string; align: "left" | "right" }) {
  return (
    <div className={cn("flex items-center gap-2", align === "right" ? "flex-row" : "flex-row-reverse")}>
      <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium whitespace-nowrap shadow-xs">
        {label}
      </span>
      <span className="h-px w-6 bg-border" />
    </div>
  );
}

function AudienceBand() {
  return (
    <section className="border-y bg-neutral-50/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:px-8 md:flex-row md:justify-between">
        <p className="shrink-0 text-sm font-medium">Made for people who make things</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {AUDIENCE.map((who) => (
            <li key={who} className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              {who}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
          <SectionTitle>Getting the inquiry is only the first step.</SectionTitle>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Your portfolio does a great job. It makes people want to work with you. Then they click your link and
              land on a form.
            </p>
            <p>
              Most forms are built to collect information, and they do that well. But the trust your work just built
              stops there. Now a stranger is asking for their budget, their timeline and their project, with nothing
              reminding them why they came.
            </p>
            <p className="font-medium text-foreground">
              Form builders solve form creation. ClientForm focuses on the trust around project intake.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ol className="relative mx-auto max-w-sm">
            {JOURNEY.map(({ icon: Icon, text }) => (
              <li key={text} className="flex flex-col items-center">
                <div className="flex w-full items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-xs">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">{text}</span>
                </div>
                <ArrowDown className="my-1.5 size-4 text-muted-foreground/50" />
              </li>
            ))}
            <li className="rounded-xl border-2 border-foreground bg-background px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold">Now they're being asked to trust you with their project.</p>
              <p className="mt-1 text-xs text-muted-foreground">This is the moment a generic form leaves empty.</p>
            </li>
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function TrustSection() {
  const points = [
    { icon: Eye, text: "Your testimonials stay beside the form, from the first question to submit." },
    { icon: Sparkles, text: "When you have lots of proof, it scrolls gently on its own." },
    { icon: MessageSquareQuote, text: "It uses testimonials you already have. No new tool to learn." },
  ];

  return (
    <section id="features" className="scroll-mt-20 border-b bg-neutral-50/60">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
        <Reveal>
          <Eyebrow>The trust layer</Eyebrow>
          <SectionTitle>Keep the proof visible while they fill out the form.</SectionTitle>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Your past clients have already done the convincing. Put their words where potential clients need them
            most: right next to the questions about budget and timeline.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <Icon className="size-4" />
                </div>
                <p className="pt-1.5 text-sm">{text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MiniForm compact title="Brand identity for Lumen" />
              <div className="relative h-80 sm:h-auto">
                <ProofPanel testimonials={SAMPLE_TESTIMONIALS.slice(1, 4)} compact moving className="absolute inset-0" />
              </div>
            </div>
            <ExampleNote className="mt-4" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Before and after</Eyebrow>
          <SectionTitle>Same project questions. More trust.</SectionTitle>
          <p className="mt-4 text-[15px] text-muted-foreground">
            You still ask everything you need. The difference is what your client sees while they answer.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border bg-neutral-50/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">A generic form</span>
                <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">Before</span>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <MiniForm variant="plain" compact className="saturate-0" />
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
                  <p className="text-sm font-medium text-muted-foreground">Nothing here to reassure them.</p>
                  <p className="mt-1 max-w-56 text-xs text-muted-foreground/80">
                    No proof, no reminder of your work. Just fields and a submit button.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Neutral and transactional. It collects details and nothing more.</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50/60 via-background to-pink-50/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">With ClientForm</span>
                <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs text-background">After</span>
              </div>
              <div className="flex-1 space-y-3">
                <MiniForm compact submitLabel="Submit project request" />
                <ProofPanel testimonials={SAMPLE_TESTIMONIALS.slice(0, 3)} compact />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The same questions, with proof from past clients right beside them.
              </p>
            </div>
          </Reveal>
        </div>
        <ExampleNote className="mt-6" />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b bg-neutral-50/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle className="max-w-xl">Four simple steps.</SectionTitle>
        </Reveal>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 80}>
              <li className="h-full rounded-2xl border bg-background p-6 shadow-xs">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground font-mono text-xs text-background">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-[15px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Sources() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Testimonial sources</Eyebrow>
          <SectionTitle>Your testimonials already exist. Put them where they matter.</SectionTitle>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Bring your existing client proof into the project request, instead of sending potential clients to a
            separate testimonial page. ClientForm doesn't collect testimonials. It shows the ones you already have.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {SOURCES.map((source, index) => {
            const sample = SAMPLE_TESTIMONIALS.find((t) => t.source === source.id);
            return (
              <Reveal key={source.id} delay={index * 80}>
                <div className="flex h-full flex-col rounded-2xl border bg-background p-5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/50">
                      <ProviderIcon testimonial={{ provider: source.id }} className="size-4" />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight">{source.name}</h3>
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <Link2 className="mt-0.5 size-3.5 shrink-0" />
                    {source.paste}
                  </p>
                  {sample && (
                    <div className="mt-5 flex flex-1 items-end rounded-xl bg-neutral-50 p-3">
                      <SampleTestimonialCard testimonial={sample} compact className="w-full" />
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b bg-neutral-50/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-md text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionTitle>Free during early access.</SectionTitle>
          <p className="mt-3 text-muted-foreground">Everything included while we build ClientForm with our first users.</p>
        </Reveal>
        <Reveal delay={100} className="mx-auto mt-10 max-w-md">
          <div className="rounded-2xl border bg-background p-7 shadow-sm">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight">$0</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 h-11 w-full">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 py-28 text-center sm:px-8">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn your next project inquiry into a <Accent>better first impression.</Accent>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Build a project form that collects the details you need and shows potential clients why they can trust
            you.
          </p>
          <Button asChild size="lg" className="mt-9">
            <Link to="/signup">
              Create your ClientForm <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <MarketingNav />
      <main>
        <Hero />
        <AudienceBand />
        <Problem />
        <TrustSection />
        <BeforeAfter />
        <HowItWorks />
        <Sources />
        <Pricing />
        <FinalCta />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} ClientForm. Made for people who make things.</p>
        </div>
      </footer>
    </div>
  );
}
