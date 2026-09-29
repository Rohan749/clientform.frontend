import { Check, Crown, RotateCcw } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import {
  backgroundCss,
  CSS_HOOKS,
  customCssProblem,
  DEFAULT_THEME,
  FONTS,
  googleFontsHref,
  isDefaultTheme,
  MAX_CUSTOM_CSS_LENGTH,
  THEME_PRESETS,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { FormTheme, ThemeBackground } from "@/types";

interface DesignPanelProps {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
  /** Pro unlocks editing. Without it the panel is a read-only preview of the options. */
  pro: boolean;
  /** Plan still loading: don't flash the upgrade card. */
  planLoading: boolean;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function DesignPanel({ theme, onChange, pro, planLoading }: DesignPanelProps) {
  const locked = !pro;
  const set = (patch: Partial<FormTheme>) => onChange({ ...theme, ...patch });
  const setBackground = (background: ThemeBackground) => set({ background });
  const cssProblem = theme.custom_css ? customCssProblem(theme.custom_css) : null;

  // Show every font in its own typeface.
  useGoogleFonts(googleFontsHref(FONTS));

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-6 pb-24 sm:px-6 lg:pb-10">
      {locked && !planLoading && <UpgradeCard pausedDesign={!isDefaultTheme(theme)} />}

      <fieldset disabled={locked} className={cn("space-y-9", locked && "pointer-events-none opacity-55 select-none")}>
        <Section title="Quick start" hint="Pick a look, then make it yours.">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {THEME_PRESETS.map((preset) => {
              const active =
                JSON.stringify({ ...theme, white_label: false, custom_css: "" }) ===
                JSON.stringify({ ...preset.theme, white_label: false, custom_css: "" });
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => set(preset.theme)}
                  className={cn(
                    "group rounded-xl border p-1.5 text-left transition-colors hover:border-foreground/30",
                    active && "border-foreground ring-1 ring-foreground",
                  )}
                >
                  <span
                    className="flex h-11 items-end rounded-lg p-1.5"
                    style={{ background: backgroundCss(preset.theme.background) }}
                  >
                    <span
                      className="h-2.5 w-7 rounded-full"
                      style={{ background: preset.theme.accent_color }}
                    />
                  </span>
                  <span className="mt-1.5 block truncate px-0.5 text-[11px] font-medium">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Branding">
          <label className="flex items-start justify-between gap-4 rounded-xl border p-4">
            <span>
              <span className="block text-sm font-medium">Remove the ClientForm badge</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Only your brand shows on the form.</span>
            </span>
            <Switch checked={theme.white_label} onCheckedChange={(white_label) => set({ white_label })} />
          </label>
        </Section>

        <Section title="Font">
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map((font) => {
              const active = theme.font === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => set({ font: font.id })}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors hover:border-foreground/30",
                    active && "border-foreground ring-1 ring-foreground",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px]" style={{ fontFamily: font.family }}>
                      {font.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{font.kind}</span>
                  </span>
                  {active && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Colors">
          <div className="space-y-3">
            <ColorField label="Text" value={theme.text_color} onChange={(text_color) => set({ text_color })} />
            <ColorField
              label="Buttons and accents"
              value={theme.accent_color}
              onChange={(accent_color) => set({ accent_color })}
            />
            <ColorField
              label="Fields and cards"
              value={theme.surface_color}
              onChange={(surface_color) => set({ surface_color })}
            />
          </div>
        </Section>

        <Section title="Background">
          <div className="inline-flex rounded-lg bg-muted p-1" role="tablist" aria-label="Background type">
            {(["solid", "gradient"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={theme.background.type === type}
                onClick={() => {
                  if (theme.background.type === type) return;
                  const base = theme.background.type === "solid" ? theme.background.color : theme.background.from;
                  setBackground(
                    type === "solid"
                      ? { type: "solid", color: base }
                      : { type: "gradient", from: base, to: "#fce7f3", angle: 135 },
                  );
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition-all",
                  theme.background.type === type
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {theme.background.type === "solid" ? (
              <ColorField
                label="Color"
                value={theme.background.color}
                onChange={(color) => setBackground({ type: "solid", color })}
              />
            ) : (
              <GradientFields background={theme.background} onChange={setBackground} />
            )}
          </div>
        </Section>

        <Section title="Custom CSS" hint="For full control. Your CSS only changes this form.">
          <textarea
            value={theme.custom_css}
            onChange={(event) => set({ custom_css: event.target.value })}
            maxLength={MAX_CUSTOM_CSS_LENGTH}
            spellCheck={false}
            aria-label="Custom CSS"
            aria-invalid={Boolean(cssProblem)}
            placeholder={".cf-title {\n  letter-spacing: -0.04em;\n}\n\n.cf-submit {\n  border-radius: 999px;\n}"}
            className="min-h-44 w-full resize-y rounded-xl border bg-neutral-50 px-3 py-2.5 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground/60 focus-visible:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive"
          />
          {cssProblem && <p className="mt-2 text-xs font-medium text-destructive">{cssProblem}</p>}
          <details className="mt-3 rounded-xl border px-4 py-3 text-sm">
            <summary className="cursor-pointer text-[13px] font-medium">Class names you can style</summary>
            <dl className="mt-3 space-y-1.5">
              {CSS_HOOKS.map((hook) => (
                <div key={hook.selector} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <dt>
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{hook.selector}</code>
                  </dt>
                  <dd className="text-muted-foreground">{hook.what}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Images and fonts must use https:// links. @import isn't supported.
            </p>
          </details>
        </Section>

        <div className="border-t pt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDefaultTheme(theme)}
            onClick={() => onChange(DEFAULT_THEME)}
          >
            <RotateCcw /> Reset to default
          </Button>
        </div>
      </fieldset>

      {locked && isDefaultTheme(theme) === false && !planLoading && (
        <div className="mt-6 flex justify-start">
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(DEFAULT_THEME)}>
            <RotateCcw /> Remove the saved design
          </Button>
        </div>
      )}
    </div>
  );
}

function UpgradeCard({ pausedDesign }: { pausedDesign: boolean }) {
  return (
    <div className="mb-8 rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 via-background to-pink-50 p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
          <Crown className="size-3.5" />
        </span>
        <p className="text-sm font-semibold">ClientForm Pro</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        {pausedDesign
          ? "Your saved design is paused. Renew Pro to show it to clients again."
          : "Make this form look like your brand. Your fonts, your colors, no ClientForm badge."}
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link to="/billing">{pausedDesign ? "Renew Pro" : "Upgrade to Pro"}</Link>
      </Button>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Native color picker plus a hex box. Typing only commits once the hex is complete. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const id = useId();
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="min-w-0 flex-1 text-sm">
        {label}
      </label>
      <div className="flex items-center gap-1.5 rounded-lg border bg-background p-1 pr-2 focus-within:ring-[3px] focus-within:ring-ring/20">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
          aria-label={`${label} color picker`}
          className="size-7 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-black/10 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-black/10 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <input
          id={id}
          value={text}
          maxLength={7}
          spellCheck={false}
          onChange={(event) => {
            const next = event.target.value.trim();
            setText(next);
            const hex = next.startsWith("#") ? next : `#${next}`;
            if (HEX.test(hex)) onChange(hex.toLowerCase());
          }}
          onBlur={() => setText(value)}
          className="w-[4.5rem] bg-transparent font-mono text-xs uppercase outline-none"
        />
      </div>
    </div>
  );
}

function GradientFields({
  background,
  onChange,
}: {
  background: Extract<ThemeBackground, { type: "gradient" }>;
  onChange: (background: ThemeBackground) => void;
}) {
  const angleId = useId();
  return (
    <>
      <div
        className="h-14 rounded-xl border"
        style={{ background: backgroundCss(background) }}
        aria-hidden
      />
      <ColorField label="Start" value={background.from} onChange={(from) => onChange({ ...background, from })} />
      <ColorField label="End" value={background.to} onChange={(to) => onChange({ ...background, to })} />
      <div className="flex items-center gap-3">
        <label htmlFor={angleId} className="flex-1 text-sm">
          Angle
        </label>
        <input
          id={angleId}
          type="range"
          min={0}
          max={360}
          step={5}
          value={background.angle}
          onChange={(event) => onChange({ ...background, angle: Number(event.target.value) })}
          className="w-32 accent-foreground"
        />
        <span className="w-10 text-right font-mono text-xs text-muted-foreground">{background.angle}°</span>
      </div>
    </>
  );
}
