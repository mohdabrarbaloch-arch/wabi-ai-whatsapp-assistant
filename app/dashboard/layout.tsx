import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("wabi_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { name: true, email: true, plan: true } });
  if (!user) redirect("/login");
  return <DashboardShell user={{ name: user.name, email: user.email, plan: user.plan }}>{children}</DashboardShell>;
}