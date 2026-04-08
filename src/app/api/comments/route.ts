import { NextRequest, NextResponse } from "next/server";
import { buildNotionCommentProperties, parseNotionComment } from "@jasperdenouden92/annotations/server";

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
        property: "Annotatie ID",
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
    const comments = (data.results ?? []).map(parseNotionComment);

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

    const { auteur, comment, annotationId, pagina, label } = await req.json();

    if (!auteur || !comment) {
      return NextResponse.json({ error: "auteur and comment are required" }, { status: 400, headers: corsHeaders });
    }

    const properties = buildNotionCommentProperties(
      { annotationId, auteur, comment, pagina, label },
      env.projectId,
    );

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

    return NextResponse.json(parseNotionComment(page), { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("Comments POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
