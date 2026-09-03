import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, type SessionPayload } from "@/lib/session";

export interface AuthedContext {
  session: SessionPayload;
  user: { id: string; email: string; name: string; plan: string };
}

export async function requireUser(req: NextRequest): Promise<{ ctx: AuthedContext } | { res: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { res: NextResponse.json({ error: "You must be logged in to do that." }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, plan: true },
  });
  if (!user) {
    return { res: NextResponse.json({ error: "Account not found." }, { status: 401 }) };
  }
  return { ctx: { session: { ...session, plan: user.plan }, user } };
}