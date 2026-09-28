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
    quote: "Juno turned our messy product idea into a 60-second demo people actually finish watching.",
  },
  {
    id: "daniel",
    source: "senja",
    name: "Daniel Okafor",
    role: "Head of Brand, Lumen",
    quote: "Clear process, sharp motion, zero back-and-forth. We've booked Juno for three launches now.",
  },
  {
    id: "sara",
    source: "testimonial_to",
    name: "Sara Lindqvist",
    role: "Marketing Lead, Atlas",
    quote: "Our explainer video finally made the product click for customers. Fast, friendly, and easy to work with.",
  },
  {
    id: "leo",
    source: "x",
    name: "Leo Martins",
    role: "Co-founder, Fieldnote",
    quote: "They understood our brand in the first call. The identity still feels right a year later.",
  },
];

export const SOURCE_LABELS: Record<TestimonialProvider, string> = {
  x: "X",
  senja: "Senja",
  testimonial_to: "Testimonial.to",
};

export const PROJECT_TYPES = ["Product demo", "Motion design", "Brand identity", "Explainer video"];
export const BUDGETS = ["Under $2k", "$2k – $5k", "$5k – $10k", "$10k+"];
