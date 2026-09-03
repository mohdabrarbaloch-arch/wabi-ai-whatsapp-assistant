import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.DEMO_USER_EMAIL || "demo@wabi.app").trim();
  const password = process.env.DEMO_USER_PASSWORD || "demo1234";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { console.log(`Demo user already exists (${email}) — skipping.`); return; }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email, name: "Demo Owner", passwordHash: hash, plan: "free",
      business: { create: { name: "Cafe Gulzar", category: "Cafe & Bakery", timezone: "Asia/Karachi", welcomeMessage: "Hi! 👋 Thanks for messaging Cafe Gulzar. How can we help you today?" } },
      knowledge: { create: [
        { question: "What are your opening hours?", answer: "We're open every day from 9:00 AM to 11:00 PM. Fridays we open at 1:30 PM after Jummah prayers.", keywords: "hours, timing, open, close, khulne, timing" },
        { question: "Do you deliver?", answer: "Yes! We deliver across Karachi through Foodpanda, Careem and our own riders (PKR 100 inside DHA). Minimum order PKR 500 for free delivery.", keywords: "delivery, order, home, foodpanda, careem, rider, deliver" },
        { question: "What are your prices for a birthday cake?", answer: "Our signature chocolate fudge cake (1kg) is PKR 2,500 and the red velvet (1kg) is PKR 2,800. Custom theme cakes start at PKR 3,500. Order 48 hours in advance for custom designs.", keywords: "cake, price, birthday, custom, order, rate, cost" },
        { question: "Do you have vegan or gluten-free options?", answer: "We have a small vegan menu (banana bread, oat cookies and a vegan brownie) and gluten-free almond cake on weekends. Ask staff for today's availability.", keywords: "vegan, gluten, free, diet, options" },
        { question: "Do you take bookings for private events?", answer: "Yes — our upper floor seats up to 40 people for private events (birthdays, meetings, kitty parties). Contact us with your date and guest count for a quote.", keywords: "booking, event, private, party, function, reserve, quote" },
      ] },
    },
  });
  void user;

  const contact = await prisma.contact.create({ data: { userId: user.id, waPhone: "923001112233", name: "Ayesha", leadScore: 7, leadStatus: "qualified" } });
  const conv = await prisma.conversation.create({ data: { userId: user.id, contactId: contact.id, status: "open", mode: "ai", leadScore: 7, leadStatus: "qualified", summary: "Ayesha asked about birthday cake prices and delivery to DHA. Interested in a custom 1kg cake — follow up with quote." } });
  await prisma.message.createMany({ data: [
    { conversationId: conv.id, role: "customer", body: "Hi! Do you do custom birthday cakes?" },
    { conversationId: conv.id, role: "assistant", body: "Hi Ayesha! 🎂 Yes, we do — custom theme cakes start at PKR 3,500 and our signature chocolate fudge (1kg) is PKR 2,500. Would you like a quote for a specific design?" },
    { conversationId: conv.id, role: "customer", body: "Yes please, and do you deliver to DHA?" },
  ] });

  console.log(`✅ Seeded demo user: ${email} / ${password}`);
  console.log("   Login at http://localhost:3000/login to explore the dashboard.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());