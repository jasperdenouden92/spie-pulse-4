import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const REPO = 'jasperdenouden92/spie-pulse-4';

export async function GET() {
  // Fetch recent commits
  const ghHeaders: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${REPO}/commits?per_page=20`,
    { headers: ghHeaders, next: { revalidate: 300 } }
  );

  if (!ghRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 502 });
  }

  const commits = await ghRes.json();

  const commitSummaries = commits
    .map((c: any) => {
      const lines = (c.commit.message as string)
        .split('\n')
        .filter((l: string) => l.trim() && !l.startsWith('Co-Authored-By:') && !l.startsWith('Co-authored-by:'));
      return `- ${lines.join(' ')} (${c.commit.author.name}, ${new Date(c.commit.author.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
    })
    .join('\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are summarising recent changes to a building management dashboard prototype called SPIE Pulse. Below are the most recent git commits.

Write a short, friendly highlights summary (3–5 bullet points) aimed at stakeholders reviewing the prototype. Focus on notable new features and improvements. Skip minor fixes unless they're significant. Be concise — one sentence per bullet. Use plain language, no jargon.

Commits:
${commitSummaries}

Respond with only the bullet points, using • as the bullet character. No intro, no outro.`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;

  return NextResponse.json({ highlights: text }, { next: { revalidate: 300 } } as any);
}
