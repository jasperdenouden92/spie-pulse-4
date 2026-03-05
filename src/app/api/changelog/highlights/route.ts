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

function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildHighlights(commits: { title: string; description: string; author: string; date: string }[]): string[] {
  const byType: Record<ChangeType, typeof commits> = { feature: [], improvement: [], fix: [], design: [] };

  for (const c of commits) {
    byType[inferType(c.title)].push(c);
  }

  const bullets: string[] = [];

  // Features — list up to 3 by name
  if (byType.feature.length > 0) {
    const names = byType.feature.slice(0, 3).map(c => titleCase(c.title.replace(/^add\s+/i, '').replace(/^implement\s+/i, '').replace(/^new\s+/i, '')));
    if (byType.feature.length === 1) {
      bullets.push(`• New: ${names[0]}.`);
    } else {
      const listed = names.slice(0, -1).join(', ') + (names.length > 1 ? ` and ${names[names.length - 1]}` : '');
      const extra = byType.feature.length > 3 ? ` (+${byType.feature.length - 3} more)` : '';
      bullets.push(`• ${byType.feature.length} new feature${byType.feature.length > 1 ? 's' : ''} added: ${listed}${extra}.`);
    }
  }

  // Improvements — summarise with most recent title
  if (byType.improvement.length > 0) {
    const top = byType.improvement[0];
    const extra = byType.improvement.length > 1 ? ` and ${byType.improvement.length - 1} other improvement${byType.improvement.length > 2 ? 's' : ''}` : '';
    bullets.push(`• Improved: ${titleCase(top.title)}${extra}.`);
  }

  // Design
  if (byType.design.length > 0) {
    const top = byType.design[0];
    const extra = byType.design.length > 1 ? ` (${byType.design.length} design changes total)` : '';
    bullets.push(`• Design update: ${titleCase(top.title)}${extra}.`);
  }

  // Fixes
  if (byType.fix.length > 0) {
    if (byType.fix.length === 1) {
      bullets.push(`• Fixed: ${titleCase(byType.fix[0].title.replace(/^fix\s+/i, ''))}.`);
    } else {
      bullets.push(`• ${byType.fix.length} bugs fixed, including: ${titleCase(byType.fix[0].title.replace(/^fix\s+/i, ''))}.`);
    }
  }

  // Contributors
  const authors = [...new Set(commits.map(c => c.author).filter(a => !a.toLowerCase().includes('bot')))];
  if (authors.length > 0) {
    bullets.push(`• ${commits.length} commits by ${authors.slice(0, 3).join(', ')}${authors.length > 3 ? ` +${authors.length - 3} more` : ''}.`);
  }

  return bullets;
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
      description: lines.slice(1).join(' ').trim(),
      author: c.commit.author.name as string,
      date: c.commit.author.date as string,
    };
  });

  const highlights = buildHighlights(commits);

  return NextResponse.json({ highlights: highlights.join('\n') });
}
