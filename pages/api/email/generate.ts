import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.credits <= 0) {
    return res.status(403).json({ message: 'No credits left' });
  }

  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant who writes marketing emails.' },
        { role: 'user', content: `Write a full marketing email based on this description: ${description}` },
      ],
    });

    const generatedEmail = completion.choices[0].message.content || '';

    // Save generated email
await prisma.email.create({
  data: {
    userId: user.id,
    content: generatedEmail,
  },
});


    // Deduct 1 credit
    await prisma.user.update({
      where: { email: session.user.email },
      data: { credits: { decrement: 1 } },
    });

    res.status(200).json({ generatedEmail });
  } catch (error) {
    console.error('OpenAI error', error);
    res.status(500).json({ message: 'Failed to generate email' });
  }
}
