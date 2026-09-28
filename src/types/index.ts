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
