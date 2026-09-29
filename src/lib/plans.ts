import type { BillingInterval } from "@/types";

/*
 * Plan copy and prices, shared by the landing page and the billing page. The amounts charged
 * are set on the Dodo Payments products; keep these in sync with them.
 */

export const PRO_PRICES: Record<BillingInterval, { amount: number; label: string; per: string; note: string }> = {
  year: { amount: 108, label: "Yearly", per: "/ year", note: "Save 3 months with the yearly plan" },
  month: { amount: 12, label: "Monthly", per: "/ month", note: "Cancel any time" },
};

export const FREE_FEATURES = [
  "As many forms as you want",
  "Reviews from X, Senja and Testimonial.to",
  "Clients can send files up to 10 MB",
  "Your own link to share",
];

export const PRO_FEATURES = [
  "Everything in Free",
  "White label: remove the ClientForm badge",
  "Your own fonts",
  "Your own text and button colors",
  "Any background color",
  "Gradient backgrounds",
  "Full CSS control",
];
