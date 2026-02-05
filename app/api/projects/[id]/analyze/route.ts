import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Fetch all feedback
    const feedback = await prisma.feedback.findMany({
      where: { projectId },
      select: {
        id: true,
        text: true,
        type: true,
        customerTier: true,
        revenue: true,
      },
    });

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: "No feedback to analyze" },
        { status: 400 }
      );
    }

    // Simple clustering by type and keywords
    const themes: Record<string, any[]> = {
      bugs: [],
      features: [],
      other: [],
    };

    feedback.forEach((item) => {
      if (item.type === "bug") {
        themes.bugs.push(item);
      } else if (item.type === "feature") {
        themes.features.push(item);
      } else {
        themes.other.push(item);
      }
    });

    // Calculate impact scores
    const calculateImpact = (items: typeof feedback) => {
      let score = 0;
      items.forEach((item) => {
        // Base score by type
        if (item.type === "bug") score += 30;
        else if (item.type === "feature") score += 20;

        // Customer tier bonus
        if (item.customerTier === "enterprise") score += 50;
        else if (item.customerTier === "pro") score += 30;
        else if (item.customerTier === "starter") score += 10;

        // Revenue bonus
        score += (item.revenue || 0) / 100;
      });
      return Math.min(score, 100);
    };

    // Generate opportunities
    const opportunities = [
      {
        id: "bugs-critical",
        title: "Critical Bugs & Issues",
        theme: "Bug Fixes",
        description: `Found ${themes.bugs.length} bug reports that need attention`,
        impact: themes.bugs.length > 5 ? "high" : themes.bugs.length > 2 ? "medium" : "low",
        impactScore: calculateImpact(themes.bugs),
        feedbackCount: themes.bugs.length,
        feedbackIds: themes.bugs.map((f) => f.id),
      },
      {
        id: "features-requested",
        title: "Feature Requests",
        theme: "New Features",
        description: `${themes.features.length} feature requests from customers`,
        impact: themes.features.length > 5 ? "high" : themes.features.length > 2 ? "medium" : "low",
        impactScore: calculateImpact(themes.features),
        feedbackCount: themes.features.length,
        feedbackIds: themes.features.map((f) => f.id),
      },
      {
        id: "general-feedback",
        title: "General Feedback",
        theme: "Other",
        description: `${themes.other.length} other feedback items`,
        impact: themes.other.length > 5 ? "medium" : "low",
        impactScore: calculateImpact(themes.other),
        feedbackCount: themes.other.length,
        feedbackIds: themes.other.map((f) => f.id),
      },
    ]
      .filter((o) => o.feedbackCount > 0)
      .sort((a, b) => b.impactScore - a.impactScore);

    // Extract common keywords (simple version)
    const allText = feedback.map((f) => f.text.toLowerCase()).join(" ");
    const words = allText.match(/\b\w+\b/g) || [];
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "must", "shall", "can", "need", "dare",
      "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
      "i", "me", "my", "we", "our", "you", "your", "he", "she", "it",
      "they", "them", "this", "that", "these", "those", "what", "which",
      "who", "whom", "when", "where", "why", "how", "all", "each",
      "every", "both", "few", "more", "most", "other", "some", "such",
      "no", "nor", "not", "only", "own", "same", "so", "than", "too",
      "very", "just", "and", "but", "if", "or", "because", "until",
      "while", "although", "though", "after", "before", "since",
    ]);
    const wordCounts: Record<string, number> = {};
    words.forEach((word) => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    const analysis = {
      projectId,
      generatedAt: new Date().toISOString(),
      feedbackCount: feedback.length,
      themes: {
        bugs: themes.bugs.length,
        features: themes.features.length,
        other: themes.other.length,
      },
      opportunities,
      topKeywords,
    };

    // Save analysis to database
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
