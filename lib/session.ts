import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "wabi_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  plan: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, plan: payload.plan })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { sub: payload.sub, email: (payload.email as string) || "", plan: (payload.plan as string) || "free" };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export const SESSION_COOKIE = COOKIE;