import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, organizations } from "../../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

const CreateProposalSchema = z.object({
  title: z.string().min(1).max(255),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  briefText: z.string().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.userId, session.user.id),
  });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const list = await db.query.proposals.findMany({
    where: eq(proposals.orgId, org.id),
    orderBy: [desc(proposals.createdAt)],
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.userId, session.user.id),
  });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  // Check usage limits
  if (org.proposalsUsed >= org.proposalsLimit) {
    return NextResponse.json(
      { error: "Proposal limit reached. Please upgrade your plan." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const data = CreateProposalSchema.parse(body);

  const [proposal] = await db
    .insert(proposals)
    .values({ orgId: org.id, ...data })
    .returning();

  return NextResponse.json(proposal, { status: 201 });
}
