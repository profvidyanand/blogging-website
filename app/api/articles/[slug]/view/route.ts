import { NextResponse } from "next/server";
import { incrementArticleViewCount } from "@/lib/site-settings";

type Props = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, context: Props) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    await incrementArticleViewCount(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
