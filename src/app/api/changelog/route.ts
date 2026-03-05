import { NextResponse } from 'next/server';

const REPO = 'jasperdenouden92/spie-pulse-4';

function inferType(title: string): 'feature' | 'improvement' | 'fix' | 'design' {
  const t = title.toLowerCase();
  if (t.startsWith('fix') || t.includes('bug') || t.includes('broken')) return 'fix';
  if (t.startsWith('add') || t.startsWith('feat') || t.startsWith('new')) return 'feature';
  if (t.startsWith('style') || t.startsWith('design') || t.includes(' ui ') || t.includes('layout')) return 'design';
  return 'improvement';
}

export async function GET() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits?per_page=40`,
    { headers, next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub API error: ${res.status} ${res.statusText}` },
      { status: res.status }
    );
  }

  const commits = await res.json();

  const entries = commits.map((c: any) => {
    const raw: string = c.commit.message;
    // Split message into lines, strip Co-Authored-By trailer
    const lines = raw
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l && !l.startsWith('Co-Authored-By:') && !l.startsWith('Co-authored-by:'));

    const title = lines[0] ?? '(no message)';
    const description = lines.slice(1).join(' ').trim();

    const date = new Date(c.commit.author.date);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return {
      sha: (c.sha as string).slice(0, 7),
      date: formattedDate,
      author: c.commit.author.name as string,
      authorAvatar: c.author?.avatar_url as string | null ?? null,
      title,
      description,
      url: c.html_url as string,
      type: inferType(title),
    };
  });

  return NextResponse.json(entries);
}
