import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple keyword extraction for themes
function extractThemes(feedbackItems: { text: string }[]): Record<string, string[]> {
  const themes: Record<string, string[]> = {};
  
  feedbackItems.forEach((item) => {
    const text = item.text.toLowerCase();
    
    // Define theme keywords
    const themeKeywords: Record<string, string[]> = {
      "dark mode": ["dark", "dark mode", "dark theme", "night mode"],
      "performance": ["slow", "speed", "fast", "performance", "loading", "lag"],
      "mobile": ["mobile", "phone", "app", "ios", "android"],
      "integrations": ["integration", "connect", "api", "webhook", "slack"],
      "reporting": ["report", "analytics", "dashboard", "stats", "metrics"],
      "notifications": ["notification", "email", "alert", "reminder"],
      "export": ["export", "download", "csv", "pdf"],
      "search": ["search", "find", "filter"],
      "ux/ui": ["confusing", "hard to find", "design", "interface"],
      "pricing": ["price", "cost", "expensive", "cheap", "subscription"],
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matched = keywords.some((kw) => text.includes(kw));
      if (matched) {
        if (!themes[theme]) themes[theme] = [];
        if (themes[theme].length < 3) { // Keep max 3 examples per theme
          themes[theme].push(item.text);
        }
      }
    });
  });

  return themes;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const feedback = await prisma.feedback.findMany({
      where: { projectId },
      select: {
        id: true,
        text: true,
        type: true,
        customerTier: true,
        source: true,
        createdAt: true,
      },
    });

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: "No feedback to analyze" },
        { status: 400 }
      );
    }

    // Group by type
    const bugs = feedback.filter((f) => f.type === "bug");
    const features = feedback.filter((f) => f.type === "feature");
    const other = feedback.filter((f) => !f.type || f.type === "other");

    // Extract themes from each group
    const bugThemes = extractThemes(bugs);
    const featureThemes = extractThemes(features);

    // Calculate impact based on tier + count
    const calculateImpact = (items: typeof feedback) => {
      let score = 0;
      let enterpriseCount = 0;
      items.forEach((item) => {
        if (item.type === "bug") score += 30;
        else if (item.type === "feature") score += 20;
        if (item.customerTier === "enterprise") {
          score += 50;
          enterpriseCount++;
        } else if (item.customerTier === "pro") {
          score += 30;
        } else {
          score += 10;
        }
      });
      return { score: Math.min(score, 100), enterpriseCount };
    };

    // Generate theme-based opportunities
    const opportunities: any[] = [];

    // Bug opportunities by theme
    Object.entries(bugThemes).forEach(([theme, examples]) => {
      const impact = calculateImpact(bugs);
      opportunities.push({
        id: `bug-${theme.replace(/\s+/g, "-")}`,
        title: `Fix: ${theme.charAt(0).toUpperCase() + theme.slice(1)} issues`,
        category: "bug",
        description: `${examples.length} reports about ${theme} problems`,
        impact: impact.score > 80 ? "high" : impact.score > 50 ? "medium" : "low",
        impactScore: impact.score,
        feedbackCount: examples.length,
        enterpriseCount: impact.enterpriseCount,
        examples: examples.slice(0, 3),
        feedbackIds: bugs.filter((b) => 
          examples.includes(b.text)
        ).map((b) => b.id),
      });
    });

    // Feature opportunities by theme
    Object.entries(featureThemes).forEach(([theme, examples]) => {
      const impact = calculateImpact(features);
      opportunities.push({
        id: `feat-${theme.replace(/\s+/g, "-")}`,
        title: `Add: ${theme.charAt(0).toUpperCase() + theme.slice(1)} feature`,
        category: "feature",
        description: `${examples.length} requests for ${theme} functionality`,
        impact: impact.score > 80 ? "high" : impact.score > 50 ? "medium" : "low",
        impactScore: impact.score,
        feedbackCount: examples.length,
        enterpriseCount: impact.enterpriseCount,
        examples: examples.slice(0, 3),
        feedbackIds: features.filter((f) => 
          examples.includes(f.text)
        ).map((f) => f.id),
      });
    });

    // Sort by impact score
    opportunities.sort((a, b) => b.impactScore - a.impactScore);

    const analysis = {
      projectId,
      generatedAt: new Date().toISOString(),
      feedbackCount: feedback.length,
      summary: {
        bugs: bugs.length,
        features: features.length,
        other: other.length,
      },
      opportunities,
    };

    // Save to database
    await prisma.analysis.create({
      data: {
        projectId,
        content: analysis as any,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const analysis = await prisma.analysis.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json(analysis.content);
  } catch (error) {
    console.error("Failed to fetch analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
