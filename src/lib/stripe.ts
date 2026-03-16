import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    proposalsPerMonth: 3,
    priceId: null,
    features: ["3 proposals (lifetime)", "AI scope generation", "PDF export", "Email support"],
  },
  starter: {
    name: "Starter",
    price: 49,
    proposalsPerMonth: 10,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      "10 proposals/month",
      "AI scope generation",
      "PDF export",
      "Brand customization",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    price: 149,
    proposalsPerMonth: 50,
    priceId: process.env.STRIPE_PRICE_GROWTH,
    features: [
      "50 proposals/month",
      "Everything in Starter",
      "Client collaboration link",
      "Proposal analytics",
      "Priority support",
    ],
  },
  agency: {
    name: "Agency",
    price: 349,
    proposalsPerMonth: Infinity,
    priceId: process.env.STRIPE_PRICE_AGENCY,
    features: [
      "Unlimited proposals",
      "Everything in Growth",
      "Multiple brand profiles",
      "Team members (up to 5)",
      "White-label PDF",
      "Dedicated support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: PlanKey): number {
  const limit = PLANS[plan].proposalsPerMonth;
  return limit === Infinity ? 999999 : limit;
}
