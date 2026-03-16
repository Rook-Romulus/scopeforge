import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, proposals } from "../../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function ProposalsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return null;

  const allProposals = await db.query.proposals.findMany({
    where: eq(proposals.orgId, org.id),
    orderBy: [desc(proposals.createdAt)],
  });

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proposals</h1>
            <p className="text-slate-400 mt-1">{allProposals.length} proposal{allProposals.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/dashboard/proposals/new" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + New Proposal
          </Link>
        </div>

        {allProposals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-semibold text-lg mb-2">No proposals yet</h3>
            <p className="text-slate-500 mb-6">Generate your first AI proposal in under 2 minutes.</p>
            <Link href="/dashboard/proposals/new" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              Create First Proposal →
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Proposal</th>
                  <th className="text-left px-6 py-3">Client</th>
                  <th className="text-left px-6 py-3">Created</th>
                  <th className="text-right px-6 py-3">Value</th>
                  <th className="text-right px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/proposals/${p.id}`} className="font-medium hover:text-blue-400 transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{p.clientName ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-right text-green-400 font-medium text-sm">
                      {p.totalValue ? formatCurrency(Number(p.totalValue)) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        p.status === "ready" ? "bg-green-950 text-green-400" :
                        p.status === "accepted" ? "bg-blue-950 text-blue-400" :
                        p.status === "generating" ? "bg-yellow-950 text-yellow-400" :
                        p.status === "lost" ? "bg-red-950 text-red-400" :
                        "bg-slate-800 text-slate-400"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
