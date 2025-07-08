import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) return res.status(401).json({ message: "Not authenticated" });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.credits <= 0) return res.status(403).json({ message: "Not enough credits" });

  const { description, tone } = req.body;
  if (!description || !tone) return res.status(400).json({ message: "Missing fields" });

  // Create prompt
  const prompt = `Write an email with the following description: "${description}". Use a ${tone} tone. Also suggest 3 subject lines.`;

  // Call OpenAI
  const aiResponse = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
  });

  const text = aiResponse.choices[0].message.content || "";
  const parts = text.split("Subject lines:") || [text];
  const emailBody = parts[0].trim();
  const subjectLines = parts[1]?.split("\n").filter(Boolean).map(line => line.trim()) || [];

  // Deduct credit
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: 1 } },
  });

  res.status(200).json({
    email: {
      body: emailBody,
      subjectLines,
    },
  });
}
