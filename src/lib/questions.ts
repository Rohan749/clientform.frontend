import { AlignLeft, AtSign, Link2, ListChecks, type LucideIcon, Paperclip, Type, Wallet } from "lucide-react";
import type { Question, QuestionType } from "@/types";

interface QuestionTypeMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Choice types render `options` as selectable pills. */
  hasOptions: boolean;
  placeholderLabel: string;
  defaults: Pick<Question, "label" | "placeholder" | "options">;
}

export const QUESTION_TYPE_META: Record<QuestionType, QuestionTypeMeta> = {
  short_text: {
    label: "Short text",
    description: "Names, companies, one-liners",
    icon: Type,
    hasOptions: false,
    placeholderLabel: "Placeholder",
    defaults: { label: "Company or brand", placeholder: "Northwind Studio", options: [] },
  },
  long_text: {
    label: "Long text",
    description: "Project details and context",
    icon: AlignLeft,
    hasOptions: false,
    placeholderLabel: "Placeholder",
    defaults: {
      label: "Tell me about your project",
      placeholder: "What are you making, who is it for, and what does success look like?",
      options: [],
    },
  },
  email: {
    label: "Email",
    description: "An additional email address",
    icon: AtSign,
    hasOptions: false,
    placeholderLabel: "Placeholder",
    defaults: { label: "Who else should be in the loop?", placeholder: "producer@company.com", options: [] },
  },
  multiple_choice: {
    label: "Multiple choice",
    description: "Pick one from a list",
    icon: ListChecks,
    hasOptions: true,
    placeholderLabel: "Placeholder",
    defaults: {
      label: "What do you need help with?",
      placeholder: "",
      options: ["Brand identity", "Motion design", "Website", "Something else"],
    },
  },
  budget: {
    label: "Budget",
    description: "Budget ranges to choose from",
    icon: Wallet,
    hasOptions: true,
    placeholderLabel: "Placeholder",
    defaults: {
      label: "What's your budget?",
      placeholder: "",
      options: ["Under $2k", "$2k – $5k", "$5k – $10k", "$10k+"],
    },
  },
  url: {
    label: "Website URL",
    description: "Links to sites or references",
    icon: Link2,
    hasOptions: false,
    placeholderLabel: "Placeholder",
    defaults: { label: "Website or reference link", placeholder: "https://", options: [] },
  },
  file: {
    label: "File upload",
    description: "Briefs, decks, references",
    icon: Paperclip,
    hasOptions: false,
    placeholderLabel: "Helper text",
    defaults: { label: "Attach a brief or references", placeholder: "PDF, images or docs up to 10 MB", options: [] },
  },
};

export function createQuestion(type: QuestionType, overrides: Partial<Question> = {}): Question {
  const { defaults } = QUESTION_TYPE_META[type];
  return {
    id: crypto.randomUUID(),
    type,
    label: defaults.label,
    placeholder: defaults.placeholder,
    options: [...defaults.options],
    required: false,
    ...overrides,
  };
}

/** Starter questions for a brand new form — a sensible creative brief. */
export function starterQuestions(): Question[] {
  return [
    createQuestion("long_text", { required: true }),
    createQuestion("multiple_choice"),
    createQuestion("budget", { required: true }),
    createQuestion("short_text", { label: "When do you need this by?", placeholder: "e.g. End of March" }),
  ];
}
