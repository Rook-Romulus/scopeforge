import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const orgId = sub.metadata?.orgId;
    const plan = (sub.metadata?.plan ?? "starter") as PlanKey;
    if (orgId) {
      await db.update(organizations).set({
        plan,
        stripeSubscriptionId: sub.id,
        proposalsLimit: PLANS[plan].proposalsPerMonth === Infinity ? 999999 : PLANS[plan].proposalsPerMonth,
        updatedAt: new Date(),
      }).where(eq(organizations.id, orgId));
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const orgId = sub.metadata?.orgId;
    if (orgId) {
      await db.update(organizations).set({
        plan: "free", stripeSubscriptionId: null, proposalsLimit: 3, updatedAt: new Date(),
      }).where(eq(organizations.id, orgId));
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orgId = session.metadata?.orgId;
    const customerId = session.customer as string;
    if (orgId && customerId) {
      await db.update(organizations).set({ stripeCustomerId: customerId, updatedAt: new Date() }).where(eq(organizations.id, orgId));
    }
  }

  return NextResponse.json({ received: true });
}
