import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { proposals, organizations } from "../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(proposals.id, id), eq(proposals.orgId, org.id)),
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(proposal);
}

const UpdateSchema = z.object({
  title: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  briefText: z.string().optional(),
  status: z.enum(["draft", "generating", "ready", "sent", "accepted", "lost"]).optional(),
}).partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data = UpdateSchema.parse(body);

  const [updated] = await db
    .update(proposals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(proposals.id, id), eq(proposals.orgId, org.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await db.query.organizations.findFirst({ where: eq(organizations.userId, session.user.id) });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(proposals).where(and(eq(proposals.id, id), eq(proposals.orgId, org.id)));
  return new NextResponse(null, { status: 204 });
}
