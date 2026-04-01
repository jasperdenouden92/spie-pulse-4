import type { VercelRequest, VercelResponse } from "@vercel/node";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.NOTION_API_KEY) {
    return res.status(500).json({ error: "NOTION_API_KEY not configured" });
  }

  const databaseId = process.env.NOTION_DATABASE_ID;
  const projectId = process.env.NOTION_PROJECT_ID;

  if (!databaseId || !projectId) {
    return res.status(500).json({ error: "NOTION_DATABASE_ID or NOTION_PROJECT_ID not configured" });
  }

  if (req.method === "GET") {
    const { project, annotationId } = req.query;

    const filter: any = {
      and: [
        {
          property: "Project",
          relation: { contains: projectId },
        },
      ],
    };

    if (annotationId) {
      filter.and.push({
        property: "Annotation",
        rich_text: { equals: String(annotationId) },
      });
    }

    const response = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        filter,
        sorts: [{ property: "Aangemaakt", direction: "descending" }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    const comments = data.results.map((page: any) => ({
      id: page.id,
      auteur: page.properties.Auteur?.rich_text?.[0]?.plain_text ?? "",
      comment: page.properties.Comment?.rich_text?.[0]?.plain_text ?? "",
      status: page.properties.Status?.status?.name ?? "Open",
      antwoord: page.properties.Antwoord?.rich_text?.[0]?.plain_text ?? null,
      aangemaakt: page.properties.Aangemaakt?.created_time ?? page.created_time,
    }));

    return res.status(200).json(comments);
  }

  if (req.method === "POST") {
    const { auteur, comment, annotationId, label } = req.body;

    if (!auteur || !comment) {
      return res.status(400).json({ error: "auteur and comment are required" });
    }

    const properties: any = {
      Auteur: { rich_text: [{ text: { content: auteur } }] },
      Comment: { title: [{ text: { content: comment } }] },
      Status: { status: { name: "Open" } },
      Project: { relation: [{ id: projectId }] },
    };

    if (annotationId) {
      properties.Annotation = { rich_text: [{ text: { content: String(annotationId) } }] };
    }

    if (label) {
      properties.Label = { rich_text: [{ text: { content: String(label) } }] };
    }

    const response = await fetch(`${NOTION_API}/pages`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const page = await response.json();

    return res.status(201).json({
      id: page.id,
      auteur,
      comment,
      status: "Open",
      antwoord: null,
      aangemaakt: page.created_time,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
