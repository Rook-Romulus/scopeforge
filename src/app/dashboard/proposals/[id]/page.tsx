import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, organizations } from "../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";

type ScopeItem = { name: string; description: string; phase: string; effortHours: number; cost: number };
type TimelinePhase = { name: string; durationWeeks: number; deliverables: string[] };

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return null;

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(proposals.id, id), eq(proposals.orgId, org.id)),
  });
  if (!proposal) notFound();

  const scope = proposal.scopeData as { executiveSummary?: string; problemStatement?: string; proposedSolution?: string; items?: ScopeItem[] } | null;
  const timeline = proposal.timelineData as { phases?: TimelinePhase[] } | null;
  const content = proposal.content as { termsAndConditions?: string; nextSteps?: string } | null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/proposals" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Proposals</Link>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                proposal.status === "ready" ? "bg-green-950 text-green-400" :
                proposal.status === "generating" ? "bg-yellow-950 text-yellow-400 animate-pulse" :
                "bg-slate-800 text-slate-400"
              }`}>{proposal.status}</span>
            </div>
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            {proposal.clientName && <p className="text-slate-400 mt-1">For {proposal.clientName} · {formatDate(proposal.createdAt)}</p>}
          </div>
          {proposal.totalValue && (
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">{formatCurrency(Number(proposal.totalValue))}</div>
              <div className="text-slate-500 text-sm">Project Value</div>
            </div>
          )}
        </div>

        {proposal.status === "generating" && (
          <div className="bg-yellow-950/30 border border-yellow-800 rounded-xl p-6 text-center mb-8">
            <div className="text-yellow-400 mb-2 animate-pulse">⚙️ Generating proposal...</div>
            <p className="text-slate-400 text-sm">AI is analyzing the brief and building your scope. Refresh in a moment.</p>
          </div>
        )}

        {proposal.status === "ready" && scope && (
          <div className="space-y-8">
            {/* Executive Summary */}
            {scope.executiveSummary && (
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-3">Executive Summary</h2>
                <p className="text-slate-300 leading-relaxed">{scope.executiveSummary}</p>
              </section>
            )}

            {/* Problem & Solution */}
            {(scope.problemStatement || scope.proposedSolution) && (
              <div className="grid md:grid-cols-2 gap-6">
                {scope.problemStatement && (
                  <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="font-semibold mb-3">The Challenge</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{scope.problemStatement}</p>
                  </section>
                )}
                {scope.proposedSolution && (
                  <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="font-semibold mb-3">Our Approach</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{scope.proposedSolution}</p>
                  </section>
                )}
              </div>
            )}

            {/* Scope Items */}
            {scope.items && scope.items.length > 0 && (
              <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="font-semibold text-lg">Project Scope</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                      <tr>
                        <th className="text-left px-6 py-3">Deliverable</th>
                        <th className="text-left px-6 py-3">Phase</th>
                        <th className="text-right px-6 py-3">Hours</th>
                        <th className="text-right px-6 py-3">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {scope.items.map((item: ScopeItem, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{item.phase}</td>
                          <td className="px-6 py-4 text-right text-slate-300 text-sm">{item.effortHours}h</td>
                          <td className="px-6 py-4 text-right font-medium text-green-400 text-sm">{formatCurrency(item.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-800/50">
                      <tr>
                        <td colSpan={2} className="px-6 py-4 font-semibold">Total</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {scope.items.reduce((s: number, i: ScopeItem) => s + i.effortHours, 0)}h
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-400 text-lg">
                          {formatCurrency(Number(proposal.totalValue ?? 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Timeline */}
            {timeline?.phases && timeline.phases.length > 0 && (
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-5">Project Timeline</h2>
                <div className="space-y-4">
                  {timeline.phases.map((phase: TimelinePhase, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 pb-4 border-b border-slate-800 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{phase.name}</h3>
                          <span className="text-slate-500 text-sm">{phase.durationWeeks} week{phase.durationWeeks !== 1 ? "s" : ""}</span>
                        </div>
                        <ul className="text-slate-400 text-sm space-y-1">
                          {phase.deliverables.map((d: string, j: number) => <li key={j}>· {d}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Next Steps */}
            {content?.nextSteps && (
              <section className="bg-blue-950/30 border border-blue-800 rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-3 text-blue-200">Next Steps</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{content.nextSteps}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
