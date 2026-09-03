import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const contacts = await prisma.contact.findMany({
    where: { userId: auth.ctx.user.id },
    orderBy: { lastMessageAt: "desc" },
    take: 200,
    include: { _count: { select: { conversations: true } } },
  });
  return NextResponse.json({ contacts });
}