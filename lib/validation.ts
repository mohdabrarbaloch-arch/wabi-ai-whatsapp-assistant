import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(120),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  timezone: z.string().trim().max(60).default("Asia/Karachi"),
  welcomeMessage: z.string().trim().max(500).optional(),
  botEnabled: z.boolean().optional(),
});

export const knowledgeSchema = z.object({
  question: z.string().trim().min(2).max(300),
  answer: z.string().trim().min(2).max(2000),
  keywords: z.string().trim().max(300).optional().or(z.literal("")),
});

export const humanReplySchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(4000),
});

export const simulatorSchema = z.object({
  waPhone: z.string().trim().min(8).max(20).regex(/^\+?[0-9]+$/, "Phone number must be digits (optionally with +)"),
  message: z.string().trim().min(1).max(4000),
});

export const waWebhookBodySchema = z.object({
  phone: z.string().trim().min(8).max(20),
  message: z.string().trim().min(1).max(4000),
});

export const waStatusSchema = z.object({
  phoneId: z.string().trim().min(1).max(120),
  token: z.string().trim().min(1).max(500),
  verifyToken: z.string().trim().min(4).max(120),
});