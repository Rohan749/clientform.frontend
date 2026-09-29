import type { CSSProperties } from "react";
import type { FontId, FormTheme, ThemeBackground } from "@/types";

/*
 * Per-form design (ClientForm Pro). Keep FONTS ids and DEFAULT_THEME in sync with
 * backend/src/lib/theme.ts, which validates every saved theme.
 */

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS font-family value. */
  family: string;
  /** Google Fonts css2 `family=` parameter; null when the app already loads it. */
  google: string | null;
  kind: "Sans" | "Serif" | "Mono";
}

const SANS_FALLBACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF_FALLBACK = 'ui-serif, Georgia, "Times New Roman", serif';
const MONO_FALLBACK = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const FONTS: FontOption[] = [
  { id: "geist", label: "Geist", family: `"Geist", ${SANS_FALLBACK}`, google: null, kind: "Sans" },
  { id: "inter", label: "Inter", family: `"Inter", ${SANS_FALLBACK}`, google: "Inter:wght@400;500;600;700", kind: "Sans" },
  { id: "dm_sans", label: "DM Sans", family: `"DM Sans", ${SANS_FALLBACK}`, google: "DM+Sans:wght@400;500;600;700", kind: "Sans" },
  { id: "manrope", label: "Manrope", family: `"Manrope", ${SANS_FALLBACK}`, google: "Manrope:wght@400;500;600;700", kind: "Sans" },
  {
    id: "plus_jakarta_sans",
    label: "Plus Jakarta Sans",
    family: `"Plus Jakarta Sans", ${SANS_FALLBACK}`,
    google: "Plus+Jakarta+Sans:wght@400;500;600;700",
    kind: "Sans",
  },
  {
    id: "space_grotesk",
    label: "Space Grotesk",
    family: `"Space Grotesk", ${SANS_FALLBACK}`,
    google: "Space+Grotesk:wght@400;500;600;700",
    kind: "Sans",
  },
  { id: "outfit", label: "Outfit", family: `"Outfit", ${SANS_FALLBACK}`, google: "Outfit:wght@400;500;600;700", kind: "Sans" },
  { id: "lora", label: "Lora", family: `"Lora", ${SERIF_FALLBACK}`, google: "Lora:wght@400;500;600;700", kind: "Serif" },
  {
    id: "playfair_display",
    label: "Playfair Display",
    family: `"Playfair Display", ${SERIF_FALLBACK}`,
    google: "Playfair+Display:wght@400;500;600;700",
    kind: "Serif",
  },
  { id: "fraunces", label: "Fraunces", family: `"Fraunces", ${SERIF_FALLBACK}`, google: "Fraunces:wght@400;500;600;700", kind: "Serif" },
  {
    id: "jetbrains_mono",
    label: "JetBrains Mono",
    family: `"JetBrains Mono", ${MONO_FALLBACK}`,
    google: "JetBrains+Mono:wght@400;500;600;700",
    kind: "Mono",
  },
];

export const fontById = (id: FontId) => FONTS.find((font) => font.id === id) ?? FONTS[0];

export const DEFAULT_THEME: FormTheme = {
  font: "geist",
  text_color: "#0a0a0a",
  accent_color: "#171717",
  surface_color: "#ffffff",
  background: { type: "solid", color: "#fafafa" },
  white_label: false,
  custom_css: "",
};

type ThemeLook = Omit<FormTheme, "white_label" | "custom_css">;
const { white_label: _whiteLabel, custom_css: _customCss, ...DEFAULT_LOOK } = DEFAULT_THEME;

/** Starting points in the Design panel (also shown on the landing page). They keep the badge and CSS settings. */
export const THEME_PRESETS: Array<{ name: string; theme: ThemeLook }> = [
  { name: "Classic", theme: DEFAULT_LOOK },
  {
    name: "Midnight",
    theme: {
      font: "inter",
      text_color: "#f5f5f5",
      accent_color: "#a78bfa",
      surface_color: "#18181b",
      background: { type: "gradient", from: "#09090b", to: "#1e1b4b", angle: 160 },
    },
  },
  {
    name: "Sunset",
    theme: {
      font: "dm_sans",
      text_color: "#3b1d0f",
      accent_color: "#ea580c",
      surface_color: "#fffaf5",
      background: { type: "gradient", from: "#fff1e6", to: "#ffd6e0", angle: 135 },
    },
  },
  {
    name: "Editorial",
    theme: {
      font: "fraunces",
      text_color: "#1c1917",
      accent_color: "#1c1917",
      surface_color: "#fffdf8",
      background: { type: "solid", color: "#f4efe6" },
    },
  },
  {
    name: "Forest",
    theme: {
      font: "manrope",
      text_color: "#052e16",
      accent_color: "#15803d",
      surface_color: "#ffffff",
      background: { type: "gradient", from: "#ecfdf5", to: "#d1fae5", angle: 180 },
    },
  },
];

export const MAX_CUSTOM_CSS_LENGTH = 20_000;

/** Fills gaps (e.g. from older saves) so the rest of the app can rely on a complete theme. */
export function normalizeTheme(theme: Partial<FormTheme> | null | undefined): FormTheme {
  return { ...DEFAULT_THEME, ...(theme ?? {}) };
}

const backgroundKey = (background: ThemeBackground) => JSON.stringify(background);

export function isDefaultTheme(theme: FormTheme) {
  return JSON.stringify(normalizeTheme(theme)) === JSON.stringify(DEFAULT_THEME);
}

/** Black or white, whichever reads better on `hex`. */
export function readableOn(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
  return luminance > 0.4 ? "#0a0a0a" : "#ffffff";
}

export function backgroundCss(background: ThemeBackground): string {
  return background.type === "solid"
    ? background.color
    : `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`;
}

/**
 * CSS custom properties that re-skin the form. Only what differs from the default is set,
 * so changing just the font keeps the standard ClientForm colors (and title gradient).
 */
export function themeStyle(theme: FormTheme): { style: CSSProperties; customColors: boolean } {
  const style: Record<string, string> = {};

  if (theme.font !== DEFAULT_THEME.font) style.fontFamily = fontById(theme.font).family;

  const customColors =
    theme.text_color !== DEFAULT_THEME.text_color ||
    theme.accent_color !== DEFAULT_THEME.accent_color ||
    theme.surface_color !== DEFAULT_THEME.surface_color;

  if (customColors) {
    const text = theme.text_color;
    const accent = theme.accent_color;
    const surface = theme.surface_color;
    Object.assign(style, {
      color: text,
      "--foreground": text,
      "--card-foreground": text,
      "--popover-foreground": text,
      "--muted-foreground": `color-mix(in oklab, ${text} 62%, ${surface})`,
      "--background": surface,
      "--card": surface,
      "--popover": surface,
      "--muted": `color-mix(in oklab, ${text} 5%, ${surface})`,
      "--accent": `color-mix(in oklab, ${text} 7%, ${surface})`,
      "--secondary": `color-mix(in oklab, ${text} 7%, ${surface})`,
      "--border": `color-mix(in oklab, ${text} 13%, ${surface})`,
      "--input": `color-mix(in oklab, ${text} 18%, ${surface})`,
      "--primary": accent,
      "--primary-foreground": readableOn(accent),
      "--ring": accent,
    });
  }

  if (backgroundKey(theme.background) !== backgroundKey(DEFAULT_THEME.background)) {
    style.background = backgroundCss(theme.background);
  }

  return { style: style as CSSProperties, customColors };
}

/** Google Fonts stylesheet URL for the given fonts (null if they're all built in). */
export function googleFontsHref(fonts: FontOption[]): string | null {
  const families = fonts.map((font) => font.google).filter((family): family is string => family !== null);
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.map((family) => `family=${family}`).join("&")}&display=swap`;
}

// ---------------------------------------------------------------------------
// Custom CSS
// ---------------------------------------------------------------------------

function decodeCssEscapes(css: string) {
  return css
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_match, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/\\(.)/g, "$1");
}

/** Same rules as the server. Returns why the CSS isn't allowed, or null. */
export function customCssProblem(css: string): string | null {
  if (css.length > MAX_CUSTOM_CSS_LENGTH) {
    return `Custom CSS can be up to ${MAX_CUSTOM_CSS_LENGTH.toLocaleString("en-US")} characters`;
  }
  const decoded = decodeCssEscapes(css.replace(/\/\*[\s\S]*?\*\//g, ""));
  if (decoded.includes("<")) return "Custom CSS can't contain HTML or the < character.";
  if (/@import/i.test(decoded)) return "@import isn't supported. Use @font-face to load a font.";
  if (/expression\s*\(|javascript:|vbscript:|-moz-binding|behavior\s*:/i.test(decoded)) {
    return "Custom CSS contains something that isn't allowed.";
  }
  for (const match of decoded.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (!/^https:\/\//i.test((match[2] ?? "").trim())) return "Links inside url() must start with https://";
  }
  return null;
}

/** The root element every custom rule is scoped to. */
export const THEME_SCOPE = ".cf-root";

// At-rules whose blocks contain normal style rules (those get scoped too).
const GROUPING_AT_RULES = new Set(["media", "supports", "container", "layer", "scope", "starting-style"]);

/** Index of the character after the block that opens at `open` (a "{"), skipping strings. */
function blockEnd(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const char = css[i];
    if (char === '"' || char === "'") {
      i = stringEnd(css, i);
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return css.length;
}

function stringEnd(css: string, start: number): number {
  const quote = css[start];
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === "\\") i++;
    else if (css[i] === quote) return i;
  }
  return css.length;
}

/** Splits a selector list on top-level commas. */
function splitSelectors(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < list.length; i++) {
    const char = list[i];
    if (char === '"' || char === "'") {
      const end = stringEnd(list, i);
      current += list.slice(i, end + 1);
      i = end;
      continue;
    }
    if (char === "(" || char === "[") depth++;
    if (char === ")" || char === "]") depth--;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function scopeSelector(selector: string, scope: string): string {
  // Page-level selectors (html, body, :root) mean "the whole form".
  const pageLevel = /^(?:(?::root|html|body)(?![\w-])\s*)+/i;
  if (pageLevel.test(selector)) {
    const rest = selector.replace(pageLevel, "").trim();
    return rest ? `${scope} ${rest}` : scope;
  }
  if (selector.startsWith(scope)) return selector;
  if (selector.startsWith("&")) return `${scope}${selector.slice(1)}`;
  return `${scope} ${selector}`;
}

/**
 * Prefixes every rule with the form's root selector so custom CSS styles the form only, and
 * never the rest of the page (e.g. the dashboard around the builder preview).
 */
export function scopeCss(css: string, scope = THEME_SCOPE): string {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let out = "";
  let i = 0;

  while (i < source.length) {
    // Find the end of the prelude: "{" opens a block, ";" ends a statement.
    let j = i;
    while (j < source.length && source[j] !== "{" && source[j] !== ";" && source[j] !== "}") {
      if (source[j] === '"' || source[j] === "'") j = stringEnd(source, j);
      j++;
    }
    const prelude = source.slice(i, j).trim();

    if (j >= source.length || source[j] !== "{") {
      // Statement at-rule (e.g. "@layer a, b;") or stray text/"}" — keep at-rules, drop the rest.
      if (prelude.startsWith("@") && source[j] === ";") out += `${prelude};\n`;
      i = j + 1;
      continue;
    }

    const end = blockEnd(source, j);
    const body = source.slice(j + 1, end - 1);

    if (prelude.startsWith("@")) {
      const name = prelude.slice(1).split(/[\s({]/, 1)[0]?.toLowerCase() ?? "";
      out += GROUPING_AT_RULES.has(name)
        ? `${prelude} {\n${scopeCss(body, scope)}}\n`
        : `${prelude} {${body}}\n`; // @font-face, @keyframes, @property… stay as written
    } else if (prelude) {
      out += `${splitSelectors(prelude).map((selector) => scopeSelector(selector, scope)).join(", ")} {${body}}\n`;
    }
    i = end;
  }

  return out;
}

/** Class hooks for custom CSS, shown in the Design panel. */
export const CSS_HOOKS: Array<{ selector: string; what: string }> = [
  { selector: ".cf-root", what: "The whole page" },
  { selector: ".cf-card", what: "The form column" },
  { selector: ".cf-brand", what: "Your name and photo" },
  { selector: ".cf-title", what: "Form title" },
  { selector: ".cf-description", what: "Form description" },
  { selector: ".cf-field", what: "Each question" },
  { selector: ".cf-label", what: "Question labels" },
  { selector: ".cf-input", what: "Text boxes" },
  { selector: ".cf-choice", what: "Answer buttons ([data-selected] when picked)" },
  { selector: ".cf-upload", what: "File upload box" },
  { selector: ".cf-submit", what: "Send button" },
  { selector: ".cf-testimonials", what: "Reviews panel" },
  { selector: ".cf-success", what: "Thank-you message" },
];
