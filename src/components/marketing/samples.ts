import type { TestimonialProvider } from "@/types";

// Illustrative content for landing-page mockups only. The studio and people are fictional,
// and every mockup that shows them is labelled as an example.

export interface SampleTestimonial {
  id: string;
  source: TestimonialProvider;
  name: string;
  role: string;
  quote: string;
}

export const SAMPLE_TESTIMONIALS: SampleTestimonial[] = [
  {
    id: "maya",
    source: "x",
    name: "Maya Chen",
    role: "Founder, Northwind",
    quote: "Juno turned our messy idea into a short demo video. People actually watch the whole thing.",
  },
  {
    id: "daniel",
    source: "senja",
    name: "Daniel Okafor",
    role: "Head of Brand, Lumen",
    quote: "Clear steps, great motion, no back-and-forth. We've hired Juno three times now.",
  },
  {
    id: "sara",
    source: "testimonial_to",
    name: "Sara Lindqvist",
    role: "Marketing Lead, Atlas",
    quote: "Our new video made our product easy to understand. Fast, friendly, and easy to work with.",
  },
  {
    id: "leo",
    source: "x",
    name: "Leo Martins",
    role: "Co-founder, Fieldnote",
    quote: "They got our brand on the first call. It still feels right a year later.",
  },
];

export const SOURCE_LABELS: Record<TestimonialProvider, string> = {
  x: "X",
  senja: "Senja",
  testimonial_to: "Testimonial.to",
};

export const PROJECT_TYPES = ["Product demo", "Motion design", "Brand identity", "Explainer video"];
export const BUDGETS = ["Under $2k", "$2k – $5k", "$5k – $10k", "$10k+"];
