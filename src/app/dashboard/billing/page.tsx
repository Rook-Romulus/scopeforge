import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return null;

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Billing & Plan</h1>
          <p className="text-slate-400 mt-1">Manage your subscription and usage.</p>
        </div>

        {/* Current Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Current Plan</h2>
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">{org.plan}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Proposals used this period</div>
              <div className="text-white font-semibold mt-1">{org.proposalsUsed} / {org.proposalsLimit === 999999 ? "Unlimited" : org.proposalsLimit}</div>
            </div>
            <div>
              <div className="text-slate-500">Monthly price</div>
              <div className="text-white font-semibold mt-1">
                {PLANS[org.plan as keyof typeof PLANS].price === 0 ? "Free" : `$${PLANS[org.plan as keyof typeof PLANS].price}/mo`}
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {org.plan !== "agency" && (
          <div>
            <h2 className="font-semibold mb-4">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(["starter", "growth", "agency"] as const).filter(p => p !== org.plan).map((planKey) => {
                const plan = PLANS[planKey];
                return (
                  <div key={planKey} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                    <div className="mb-4">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="text-2xl font-bold mt-1">${plan.price}<span className="text-base font-normal text-slate-400">/mo</span></div>
                    </div>
                    <ul className="space-y-2 flex-1 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-green-400">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <form action="/api/billing/checkout" method="POST">
                      <input type="hidden" name="plan" value={planKey} />
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                        Upgrade to {plan.name}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {org.stripeSubscriptionId && (
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h2 className="font-semibold mb-2">Manage Subscription</h2>
            <p className="text-slate-400 text-sm mb-4">Update payment method, download invoices, or cancel your subscription.</p>
            <form action="/api/billing/portal" method="POST">
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                Open Billing Portal →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
