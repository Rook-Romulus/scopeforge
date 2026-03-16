import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, organizations, brandProfiles, usageEvents } from "../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { streamProposalGeneration } from "@/lib/ai/chains/proposal-chain";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.userId, session.user.id),
  });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(proposals.id, id), eq(proposals.orgId, org.id)),
  });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (!proposal.briefText) {
    return NextResponse.json({ error: "Proposal has no brief text" }, { status: 400 });
  }

  const brand = await db.query.brandProfiles.findFirst({
    where: eq(brandProfiles.orgId, org.id),
  });

  // Mark as generating
  await db
    .update(proposals)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(proposals.id, id));

  // Stream SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const generator = streamProposalGeneration(proposal.briefText!, {
          companyName: brand?.companyName ?? undefined,
          defaultTerms: brand?.defaultTerms ?? undefined,
        });

        for await (const chunk of generator) {
          if (chunk.type === "progress") {
            send("progress", { message: chunk.data });
          } else if (chunk.type === "complete") {
            const result = chunk.data as Awaited<ReturnType<typeof import("@/lib/ai/chains/proposal-chain").generateProposal>>;

            // Save to DB
            await db
              .update(proposals)
              .set({
                title: result.title,
                status: "ready",
                scopeData: {
                  executiveSummary: result.executiveSummary,
                  problemStatement: result.problemStatement,
                  proposedSolution: result.proposedSolution,
                  items: result.scopeItems,
                },
                timelineData: { phases: result.timeline },
                costData: {
                  totalHours: result.totalHours,
                  currency: result.currency,
                },
                content: {
                  termsAndConditions: result.termsAndConditions,
                  nextSteps: result.nextSteps,
                },
                totalValue: String(result.totalCost),
                currency: result.currency,
                updatedAt: new Date(),
              })
              .where(eq(proposals.id, id));

            // Log usage
            await db.insert(usageEvents).values({
              orgId: org.id,
              proposalId: id,
              eventType: "proposal_generated",
              metadata: { totalCost: result.totalCost, itemCount: result.scopeItems.length },
            });

            // Increment usage count
            await db
              .update(organizations)
              .set({
                proposalsUsed: org.proposalsUsed + 1,
                updatedAt: new Date(),
              })
              .where(eq(organizations.id, org.id));

            send("complete", { proposalId: id, result });
          } else if (chunk.type === "error") {
            await db
              .update(proposals)
              .set({ status: "draft", updatedAt: new Date() })
              .where(eq(proposals.id, id));
            send("error", { message: chunk.data });
          }
        }
      } catch (err) {
        await db
          .update(proposals)
          .set({ status: "draft", updatedAt: new Date() })
          .where(eq(proposals.id, id));
        send("error", { message: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
