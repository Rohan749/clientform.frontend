import {
  ArrowRight,
  BadgeCheck,
  Blend,
  Code2,
  Crown,
  Eye,
  Link2,
  MessageCircle,
  MessageSquareQuote,
  Palette,
  Sparkles,
  Type,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { FreePlanCard, IntervalToggle, ProPlanCard } from "@/components/billing/PlanCards";
import { Logo, LogoMark } from "@/components/common/Logo";
import { BrowserFrame } from "@/components/forms/BrowserFrame";
import { ProviderIcon } from "@/components/forms/TestimonialCard";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MiniForm } from "@/components/marketing/MiniForm";
import { ProofPanel } from "@/components/marketing/ProofPanel";
import { Reveal, useInView } from "@/components/marketing/Reveal";
import { SampleTestimonialCard } from "@/components/marketing/SampleTestimonialCard";
import { SAMPLE_TESTIMONIALS } from "@/components/marketing/samples";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import { fontById, googleFontsHref, THEME_PRESETS, themeStyle } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { BillingInterval, TestimonialProvider } from "@/types";

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

/** What a potential client quietly wonders before starting a project (shown as speech bubbles). */
const CLIENT_DOUBTS: Array<{ text: string; indent: string }> = [
  { text: "Can they really do the job?", indent: "ml-0" },
  { text: "Will they get what I want?", indent: "ml-6 sm:ml-10" },
  { text: "Will they be easy to work with?", indent: "ml-2 sm:ml-4" },
  { text: "Will they finish on time?", indent: "ml-8 sm:ml-14" },
  { text: "Have they done this before?", indent: "ml-3 sm:ml-6" },
];

const STEPS = [
  { title: "Make your project form", body: "Add the questions you want to ask." },
  { title: "Add your best reviews", body: "Bring them in from X, Senja or Testimonial.to." },
  { title: "Share your link", body: "Send one link to new clients." },
  { title: "Let your reviews help", body: "Clients see your reviews while they tell you about their project." },
];

const SOURCES: Array<{ id: TestimonialProvider; name: string; paste: string }> = [
  { id: "x", name: "X", paste: "Paste a link to a post where a client said nice things about you." },
  { id: "senja", name: "Senja", paste: "Paste your Senja widget link or code." },
  { id: "testimonial_to", name: "Testimonial.to", paste: "Paste your Wall of Love link or code." },
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
      Example form. The studio and reviews are made up.
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
            For freelancers, designers and studios
          </span>
          <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl sm:leading-[1.05]">
            Just a form <Accent>that builds trust.</Accent>
          </h1>
          <div className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-balance text-muted-foreground sm:text-sm">
            Don't lose clients at your form. You already have testimonials. Show them where they matter.
ClientForm lets you add testimonials to your project forms, so clients feel more confident before they submit.
          </div>
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
          <div className="absolute top-1/2 -left-3 hidden -translate-x-full -translate-y-1/2 min-[1400px]:block">
            <Callout label="Your questions" align="right" />
          </div>
          <div className="absolute top-1/3 -right-3 hidden translate-x-full min-[1400px]:block">
            <Callout label="Reviews from past clients" align="left" />
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
          <SectionTitle>There's a gap between “I love this” and “Let's work together.”</SectionTitle>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>A client finds your work and likes it. Then they click your link to start a project.</p>
            <p>
              Now you ask them for real things. Their budget. Their deadline. Details about their business. That
              takes time, and it takes trust.
            </p>
            <p>So far, they've only seen your work. They don't know yet what it's like to work with you.</p>
            <p className="font-medium text-foreground">
              Reviews from past clients fill that gap. They show that other people worked with you and were happy.
              ClientForm puts those reviews right next to your form.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ClientThoughts />
        </Reveal>
      </div>
    </section>
  );
}

/** The client's unspoken doubts, shown as a loose stack of speech bubbles. */
function ClientThoughts() {
  // The whole card triggers once, then the bubbles appear one after another.
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="mx-auto w-full max-w-md rounded-3xl border bg-neutral-50/70 p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          <MessageCircle className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">What your client is thinking</p>
          <p className="text-xs text-muted-foreground">Right before they fill out your form</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5" aria-label="Questions a potential client asks">
        {CLIENT_DOUBTS.map((doubt, index) => (
          <li
            key={doubt.text}
            style={{ transitionDelay: `${250 + index * 120}ms` }}
            className={cn(
              "flex transition-all duration-500 ease-out motion-reduce:transition-none",
              doubt.indent,
              inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
            )}
          >
            <span className="inline-block max-w-full rounded-2xl rounded-bl-md border bg-background px-4 py-2.5 text-sm shadow-xs">
              {doubt.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border-2 border-foreground bg-background px-4 py-4">
        <p className="text-sm font-semibold">A plain form can't answer these.</p>
        <p className="mt-1 text-sm text-muted-foreground">Your past clients can.</p>
      </div>
    </div>
  );
}

function TrustSection() {
  const points = [
    { icon: Eye, text: "Your reviews stay next to the form, from the first question to the last." },
    { icon: Sparkles, text: "Got lots of reviews? They scroll by slowly on their own." },
    { icon: MessageSquareQuote, text: "Use the reviews you already have. Nothing new to learn." },
  ];

  return (
    <section id="features" className="scroll-mt-20 border-b bg-neutral-50/60">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
        <Reveal>
          <Eyebrow>Why it works</Eyebrow>
          <SectionTitle>Show your reviews while they fill out the form.</SectionTitle>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Your past clients already said great things about you. Put their words right next to the questions about
            budget and time.
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
          <SectionTitle>Same questions. More trust.</SectionTitle>
          <p className="mt-4 text-[15px] text-muted-foreground">
            You still ask the same things. The only change is what your client sees.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border bg-neutral-50/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">A plain form</span>
                <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">Before</span>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <MiniForm variant="plain" compact className="saturate-0" />
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
                  <p className="text-sm font-medium text-muted-foreground">Nothing here to help them trust you.</p>
                  <p className="mt-1 max-w-56 text-xs text-muted-foreground/80">
                    No reviews. No reminder of your work. Just boxes and a button.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">It asks for details. That's all it does.</p>
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
                The same questions, with reviews from past clients right next to them.
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
          <Eyebrow>Where reviews come from</Eyebrow>
          <SectionTitle>You already have reviews. Put them where they count.</SectionTitle>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Don't send new clients to another page to find them. Show them on your project form. ClientForm doesn't
            collect reviews. It shows the ones you already have.
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

/** The Pro look-switcher: the same form, four ways. "Free" keeps the ClientForm badge. */
const SHOWCASE_LOOKS = [
  { name: "Free", preset: null },
  ...THEME_PRESETS.filter((preset) => preset.name !== "Classic").slice(0, 3).map((preset) => ({ name: preset.name, preset })),
];

function ProSection() {
  const [active, setActive] = useState(1);
  const [ref, inView] = useInView<HTMLDivElement>();
  const look = SHOWCASE_LOOKS[active] ?? SHOWCASE_LOOKS[0];
  const themed = look.preset ? themeStyle({ ...look.preset.theme, white_label: true, custom_css: "" }) : null;

  // Only fetch the showcase fonts once the section is on screen.
  useGoogleFonts(
    inView ? googleFontsHref(SHOWCASE_LOOKS.flatMap((item) => (item.preset ? [fontById(item.preset.theme.font)] : []))) : null,
  );

  const points = [
    { icon: BadgeCheck, text: "No ClientForm badge. Only your brand shows." },
    { icon: Type, text: "Pick a font that fits your style." },
    { icon: Palette, text: "Choose your own text and button colors." },
    { icon: Blend, text: "Use any background color, or a gradient." },
    { icon: Code2, text: "Know CSS? Change anything you like." },
  ];

  return (
    <section id="pro" className="scroll-mt-20 border-b bg-neutral-50/60">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
        <Reveal>
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <Crown className="size-3.5" /> ClientForm Pro
            </span>
          </Eyebrow>
          <SectionTitle>Make the form look like you.</SectionTitle>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Your form is often the first thing a new client fills out. With Pro, it can match your brand. Your reviews
            still sit right next to it.
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
          <Button asChild variant="outline" className="mt-9">
            <a href="#pricing">
              See Pro pricing <ArrowRight />
            </a>
          </Button>
        </Reveal>

        <Reveal delay={120}>
          <div ref={ref}>
            <div className="mb-4 flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Example looks">
              {SHOWCASE_LOOKS.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={index === active}
                  onClick={() => setActive(index)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    index === active
                      ? "border-foreground bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                  {item.preset && <span className={cn("ml-1", index === active ? "opacity-70" : "text-violet-600")}>Pro</span>}
                </button>
              ))}
            </div>

            <BrowserFrame url="clientform.com/f/juno-studio" className="shadow-xl shadow-black/[0.06]">
              <div
                className="cf-root relative bg-neutral-50 p-3 transition-[background] duration-500 sm:p-5"
                style={themed?.style}
                data-cf-colors={themed?.customColors ? "" : undefined}
              >
                <MiniForm compact className="shadow-xs transition-colors duration-500" />
                <div className="mt-3 flex h-7 justify-end">
                  {!look.preset && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 font-sans text-neutral-950 shadow-sm animate-in fade-in-0">
                      <LogoMark className="size-4" />
                      <span className="text-[10px] text-neutral-500">Powered by</span>
                      <span className="text-xs font-semibold">ClientForm</span>
                    </span>
                  )}
                </div>
              </div>
            </BrowserFrame>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {look.preset ? "A Pro look. No ClientForm badge." : "The Free look, with the ClientForm badge."} Example form.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  const { user } = useAuth();
  const [interval, setBillingInterval] = useState<BillingInterval>("year");
  const upgradePath = `/billing?interval=${interval}`;
  const proHref = user ? upgradePath : `/signup?next=${encodeURIComponent(upgradePath)}`;

  return (
    <section id="pricing" className="scroll-mt-20 border-b">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionTitle>Start free. Go Pro when you want more.</SectionTitle>
          <p className="mt-3 text-muted-foreground">
            Free has everything you need to show your reviews. Pro makes the form look like your brand.
          </p>
          <IntervalToggle value={interval} onChange={setBillingInterval} className="mt-8" />
        </Reveal>
        <Reveal delay={100} className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <FreePlanCard
            action={
              <Button asChild variant="outline" className="h-11 w-full">
                <Link to={user ? "/dashboard" : "/signup"}>{user ? "Go to dashboard" : "Get started for free"}</Link>
              </Button>
            }
          />
          <ProPlanCard
            interval={interval}
            action={
              <Button asChild className="h-11 w-full">
                <Link to={proHref}>
                  Go Pro <ArrowRight />
                </Link>
              </Button>
            }
          />
        </Reveal>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Both plans show your reviews the same way. Pro only changes how the form looks. Cancel any time.
        </p>
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
            Make a <Accent>great first impression</Accent> on your next client.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Build a form that asks what you need and shows why clients can trust you.
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
        <ProSection />
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
