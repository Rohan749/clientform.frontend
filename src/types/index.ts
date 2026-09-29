export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "email",
  "multiple_choice",
  "budget",
  "url",
  "file",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type FormStatus = "draft" | "published" | "archived";
export type SubmissionStatus = "new" | "reviewed" | "archived";

/** Add new providers here and in lib/testimonials.ts (and the backend provider registry). */
export type TestimonialProvider = "x" | "senja" | "testimonial_to";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder: string;
  required: boolean;
  options: string[];
}

export interface Testimonial {
  id: string;
  provider: TestimonialProvider;
  url: string;
  author_name: string | null;
  author_handle: string | null;
  content: string | null;
}

export type FontId =
  | "geist"
  | "inter"
  | "dm_sans"
  | "manrope"
  | "plus_jakarta_sans"
  | "space_grotesk"
  | "outfit"
  | "lora"
  | "playfair_display"
  | "fraunces"
  | "jetbrains_mono";

export type ThemeBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number };

/** Per-form design (ClientForm Pro). Mirrors backend/src/lib/theme.ts. */
export interface FormTheme {
  font: FontId;
  text_color: string;
  accent_color: string;
  surface_color: string;
  background: ThemeBackground;
  /** Hides the ClientForm badge. */
  white_label: boolean;
  custom_css: string;
}

export type BillingInterval = "month" | "year";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "on_hold"
  | "paused"
  | "cancelled"
  | "failed"
  | "expired"
  | "past_due";

export interface BillingState {
  configured: boolean;
  plan: "free" | "pro";
  subscription: {
    status: SubscriptionStatus;
    interval: BillingInterval | null;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
    past_due_ends_at: string | null;
  } | null;
  has_billing_account: boolean;
}

export interface Branding {
  name: string | null;
  avatar_url: string | null;
  website_url: string | null;
}

export interface FormRecord {
  id: string;
  name: string;
  slug: string | null;
  title: string;
  description: string;
  testimonials_heading: string;
  testimonials_description: string;
  theme: FormTheme;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface FormWithContent extends FormRecord {
  questions: Question[];
  testimonials: Testimonial[];
}

export interface FormSummary extends FormRecord {
  submission_count: number;
}

export interface FormDraft {
  name: string;
  title: string;
  description: string;
  testimonials_heading: string;
  testimonials_description: string;
  theme: FormTheme;
  questions: Question[];
  testimonials: Testimonial[];
}

export interface PublicForm {
  slug: string;
  title: string;
  description: string;
  testimonials_heading: string;
  testimonials_description: string;
  questions: Question[];
  testimonials: Testimonial[];
  branding: Branding;
  /** The owner's custom design, only while they're on Pro. */
  theme: FormTheme | null;
  show_badge: boolean;
}

export interface SubmissionListItem {
  id: string;
  form_id: string;
  name: string;
  email: string;
  status: SubmissionStatus;
  submitted_at: string;
  form: { id: string; name: string } | null;
}

export interface SubmissionAnswer {
  id: string;
  question_id: string | null;
  question_label: string;
  question_type: QuestionType;
  value: string;
  position: number;
  file_url?: string | null;
  file_name?: string | null;
}

export interface SubmissionDetail extends Omit<SubmissionListItem, "form"> {
  form: { id: string; name: string; slug: string | null } | null;
  answers: SubmissionAnswer[];
}

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  website_url: string | null;
  email: string | null;
}

export interface DashboardData {
  stats: {
    forms: number;
    published: number;
    submissions: number;
    new_submissions: number;
  };
  recent_submissions: SubmissionListItem[];
}
