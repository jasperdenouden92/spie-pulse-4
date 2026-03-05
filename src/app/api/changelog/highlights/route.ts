import { NextResponse } from 'next/server';

const REPO = 'jasperdenouden92/spie-pulse-4';

type ChangeType = 'feature' | 'improvement' | 'fix' | 'design';

function inferType(title: string): ChangeType {
  const t = title.toLowerCase();
  if (t.startsWith('fix') || t.includes('bug') || t.includes('broken') || t.includes('correct')) return 'fix';
  if (t.startsWith('add') || t.startsWith('feat') || t.startsWith('new') || t.includes('implement')) return 'feature';
  if (t.startsWith('style') || t.startsWith('design') || t.includes(' ui') || t.includes('layout') || t.includes('visual')) return 'design';
  return 'improvement';
}

// Strip common prefixes from commit titles for cleaner display
function cleanTitle(title: string): string {
  return title
    .replace(/^(add|feat|fix|update|improve|refactor|remove|hide|replace|implement)\s+/i, '')
    .replace(/^(feat|fix|chore|style|docs|refactor|perf|test)(\(.+?\))?:\s*/i, '')
    .trim();
}

function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export interface HighlightsData {
  commitCount: number;
  authors: string[];
  sections: {
    type: ChangeType;
    items: string[];
  }[];
}

export async function GET() {
  const ghHeaders: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits?per_page=20`,
    { headers: ghHeaders, next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: `GitHub API error: ${res.status}` }, { status: 502 });
  }

  const raw = await res.json();

  const commits = raw.map((c: any) => {
    const lines = (c.commit.message as string)
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l && !l.startsWith('Co-Authored-By:') && !l.startsWith('Co-authored-by:'));
    return {
      title: lines[0] ?? '',
      author: c.commit.author.name as string,
    };
  });

  const byType: Record<ChangeType, string[]> = { feature: [], improvement: [], fix: [], design: [] };

  for (const c of commits) {
    const type = inferType(c.title);
    byType[type].push(titleCase(cleanTitle(c.title)));
  }

  const sections = (['feature', 'improvement', 'design', 'fix'] as ChangeType[])
    .filter((t) => byType[t].length > 0)
    .map((type) => ({ type, items: byType[type].slice(0, 4) }));

  const authors = [...new Set(
    commits.map((c: { author: string }) => c.author).filter((a: string) => !a.toLowerCase().includes('bot'))
  )] as string[];

  const data: HighlightsData = {
    commitCount: commits.length,
    authors: authors.slice(0, 5),
    sections,
  };

  return NextResponse.json(data);
}
