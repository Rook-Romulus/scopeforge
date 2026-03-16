import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, proposals } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  let org = await db.query.organizations.findFirst({
    where: eq(organizations.userId, session.user.id),
  });

  // Auto-create org on first login
  if (!org) {
    const slug = session.user.email?.split("@")[0] ?? "my-agency";
    [org] = await db.insert(organizations).values({
      name: session.user.name ?? "My Agency",
      slug,
      userId: session.user.id,
    }).returning();
  }

  const recentProposals = await db.query.proposals.findMany({
    where: eq(proposals.orgId, org.id),
    orderBy: [desc(proposals.createdAt)],
    limit: 5,
  });

  const usagePercent = Math.min(100, Math.round((org.proposalsUsed / org.proposalsLimit) * 100));

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {session.user.name?.split(" ")[0] ?? "there"}</p>
          </div>
          <Link
            href="/dashboard/proposals/new"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            + New Proposal
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Plan</div>
            <div className="text-xl font-bold capitalize">{org.plan}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Proposals Used</div>
            <div className="text-xl font-bold">{org.proposalsUsed} / {org.proposalsLimit === 999999 ? "∞" : org.proposalsLimit}</div>
            <div className="mt-2 bg-slate-800 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Total Proposals</div>
            <div className="text-xl font-bold">{recentProposals.length}</div>
          </div>
        </div>

        {/* Recent proposals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold">Recent Proposals</h2>
            <Link href="/dashboard/proposals" className="text-blue-400 hover:text-blue-300 text-sm">View all</Link>
          </div>
          {recentProposals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold mb-2">No proposals yet</h3>
              <p className="text-slate-500 text-sm mb-5">Create your first AI-generated proposal in under 2 minutes.</p>
              <Link href="/dashboard/proposals/new" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Create First Proposal →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentProposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/proposals/${p.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-slate-500 text-sm">{p.clientName ?? "No client"} · {formatDate(p.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {p.totalValue && (
                      <span className="text-green-400 font-medium">{formatCurrency(Number(p.totalValue))}</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      p.status === "ready" ? "bg-green-950 text-green-400" :
                      p.status === "generating" ? "bg-yellow-950 text-yellow-400" :
                      "bg-slate-800 text-slate-400"
                    }`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {org.plan === "free" && (
          <div className="mt-6 bg-blue-950/30 border border-blue-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-200">Running low on proposals?</h3>
              <p className="text-blue-400 text-sm mt-1">Upgrade to Starter for $49/mo and get 10 proposals every month.</p>
            </div>
            <Link href="/dashboard/billing" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Upgrade →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
