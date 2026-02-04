import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json({
    message: "PM Analyzer workflow has been updated",
    help: "Instead of auto-building, click 'Copy for Cursor' to get the spec text and implement it in your IDE",
    newWorkflow: [
      "1. Feedback is analyzed and a spec is generated",
      "2. Click 'Copy for Cursor' on a feedback item",
      "3. Paste the spec into Cursor/Claude Code",
      "4. Engineer implements the feature/fix",
      "5. Create a PR and merge it",
      "6. PM Analyzer automatically marks it as 'shipped' via GitHub webhook"
    ],
    docUrl: "https://github.com/Fresh-Industries/pm-analyzer#workflow"
  }, { status: 410 }); // 410 Gone - the old build endpoint is deprecated
}
