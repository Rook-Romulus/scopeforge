import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

const CheckoutSchema = z.object({ plan: z.enum(["starter", "growth", "agency"]) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { plan } = CheckoutSchema.parse(body);
  const planConfig = PLANS[plan as PlanKey];
  if (!planConfig.priceId || planConfig.priceId === `price_${plan}_placeholder`) {
    return NextResponse.json({ error: "Billing not yet configured" }, { status: 503 });
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.userId, session.user.id),
  });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: org.stripeCustomerId ?? undefined,
    customer_email: org.stripeCustomerId ? undefined : session.user.email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: { orgId: org.id, plan },
    subscription_data: { metadata: { orgId: org.id, plan } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
