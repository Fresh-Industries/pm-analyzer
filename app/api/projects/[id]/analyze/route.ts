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

    // Calculate impact based on tier, type, AND volume
    const calculateImpact = (items: typeof feedback, count: number) => {
      let score = 0;
      let enterpriseCount = 0;
      
      items.forEach((item) => {
        // Base score by type
        if (item.type === "bug") score += 20;
        else if (item.type === "feature") score += 15;

        // Customer tier bonus
        if (item.customerTier === "enterprise") {
          score += 30;
          enterpriseCount++;
        } else if (item.customerTier === "pro") {
          score += 15;
        } else {
          score += 5;
        }
      });

      // Volume bonus (more reports = higher priority)
      if (count >= 5) score += 30;
      else if (count >= 3) score += 15;
      else if (count >= 2) score += 5;

      return { score: Math.min(score, 100), enterpriseCount };
    };

    // Generate theme-based opportunities
    const opportunities: any[] = [];

    // Bug opportunities by theme
    Object.entries(bugThemes).forEach(([theme, examples]) => {
      const filteredBugs = bugs.filter(b => examples.includes(b.text));
      const count = filteredBugs.length;
      const impact = calculateImpact(filteredBugs, count);
      opportunities.push({
        id: `bug-${theme.replace(/\s+/g, "-")}`,
        title: `Fix: ${theme.charAt(0).toUpperCase() + theme.slice(1)} issues`,
        category: "bug",
        description: `${count} report${count > 1 ? 's' : ''} about ${theme}`,
        impact: impact.score >= 75 ? "high" : impact.score >= 40 ? "medium" : "low",
        impactScore: impact.score,
        feedbackCount: count,
        enterpriseCount: impact.enterpriseCount,
        examples: examples.slice(0, 3),
        feedbackIds: filteredBugs.map((b) => b.id),
      });
    });

    // Feature opportunities by theme
    Object.entries(featureThemes).forEach(([theme, examples]) => {
      const filteredFeatures = features.filter(f => examples.includes(f.text));
      const count = filteredFeatures.length;
      const impact = calculateImpact(filteredFeatures, count);
      opportunities.push({
        id: `feat-${theme.replace(/\s+/g, "-")}`,
        title: `Add: ${theme.charAt(0).toUpperCase() + theme.slice(1)} feature`,
        category: "feature",
        description: `${count} request${count > 1 ? 's' : ''} for ${theme}`,
        impact: impact.score >= 75 ? "high" : impact.score >= 40 ? "medium" : "low",
        impactScore: impact.score,
        feedbackCount: count,
        enterpriseCount: impact.enterpriseCount,
        examples: examples.slice(0, 3),
        feedbackIds: filteredFeatures.map((f) => f.id),
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
