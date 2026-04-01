import { NextRequest, NextResponse } from "next/server";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function envOrError() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  const projectId = process.env.NOTION_PROJECT_ID;

  if (!apiKey || !databaseId || !projectId) {
    return { error: "NOTION_API_KEY, NOTION_DATABASE_ID or NOTION_PROJECT_ID not configured" };
  }
  return { apiKey, databaseId, projectId };
}

export async function GET(req: NextRequest) {
  try {
    const env = envOrError();
    if ("error" in env) {
      return NextResponse.json({ error: env.error }, { status: 500, headers: corsHeaders });
    }

    const { searchParams } = req.nextUrl;
    const annotationId = searchParams.get("annotationId");

    const filter: any = {
      and: [
        {
          property: "Project",
          relation: { contains: env.projectId },
        },
      ],
    };

    if (annotationId) {
      filter.and.push({
        property: "Annotation",
        rich_text: { equals: annotationId },
      });
    }

    const response = await fetch(`${NOTION_API}/databases/${env.databaseId}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        filter,
        sorts: [{ property: "Aangemaakt", direction: "descending" }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Notion query failed:", response.status, err);
      return NextResponse.json({ error: err }, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();

    const comments = (data.results ?? []).map((page: any) => ({
      id: page.id,
      auteur: page.properties.Auteur?.rich_text?.[0]?.plain_text ?? "",
      comment: page.properties.Comment?.rich_text?.[0]?.plain_text ?? "",
      status: page.properties.Status?.status?.name ?? "Open",
      antwoord: page.properties.Antwoord?.rich_text?.[0]?.plain_text ?? null,
      aangemaakt: page.properties.Aangemaakt?.created_time ?? page.created_time,
    }));

    return NextResponse.json(comments, { headers: corsHeaders });
  } catch (err) {
    console.error("Comments GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const env = envOrError();
    if ("error" in env) {
      return NextResponse.json({ error: env.error }, { status: 500, headers: corsHeaders });
    }

    const { auteur, comment, annotationId, label } = await req.json();

    if (!auteur || !comment) {
      return NextResponse.json({ error: "auteur and comment are required" }, { status: 400, headers: corsHeaders });
    }

    const properties: any = {
      Auteur: { rich_text: [{ text: { content: auteur } }] },
      Comment: { title: [{ text: { content: comment } }] },
      Status: { status: { name: "Open" } },
      Project: { relation: [{ id: env.projectId }] },
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
        parent: { database_id: env.databaseId },
        properties,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Notion create failed:", response.status, err);
      return NextResponse.json({ error: err }, { status: response.status, headers: corsHeaders });
    }

    const page = await response.json();

    return NextResponse.json({
      id: page.id,
      auteur,
      comment,
      status: "Open",
      antwoord: null,
      aangemaakt: page.created_time,
    }, { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("Comments POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
