import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Verify GitHub webhook signature
function verifySignature(req: NextRequest, body: string): boolean {
  const signature = req.headers.get("x-hub-signature-256");
  const token = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !token) return false;

  const crypto = require("crypto");
  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", token)
    .update(body)
    .digest("hex")}`;

  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = request.headers.get("x-github-event");
    const deliveryId = request.headers.get("x-github-delivery");

    // Verify webhook (optional but recommended)
    const signatureValid = verifySignature(request, body);
    if (!signatureValid && process.env.NODE_ENV === "production") {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);

    // Handle pull request merged events
    if (event === "pull_request" && payload.action === "closed") {
      const pr = payload.pull_request;
      
      // Only process merged PRs
      if (pr.merged) {
        const repoFullName = payload.repository.full_name; // "owner/repo"
        const prUrl = pr.html_url;
        const prTitle = pr.title;

        // Find feedback linked to this PR
        // Search by PR URL or pattern match in title
        const linkedFeedback = await db.feedback.findMany({
          where: {
            githubPrUrl: prUrl,
          },
        });

        // Also try to find by matching title patterns
        const potentialMatches = await db.feedback.findMany({
          where: {
            project: {
              githubRepo: repoFullName,
            },
            status: "building",
            NOT: {
              githubPrUrl: null,
            },
          },
        });

        // Update all linked feedback to shipped
        for (const feedback of linkedFeedback) {
          await db.feedback.update({
            where: { id: feedback.id },
            data: {
              status: "shipped",
              shippedAt: new Date(),
            },
          });
        }

        // Also update potential matches if they match the PR
        for (const feedback of potentialMatches) {
          // Simple pattern matching - could be improved
          const feedbackWords = feedback.text.toLowerCase().split(" ");
          const prWords = prTitle.toLowerCase().split(" ");
          const overlap = feedbackWords.filter(w => w.length > 3 && prWords.includes(w));
          
          if (overlap.length >= 2) {
            await db.feedback.update({
              where: { id: feedback.id },
              data: {
                status: "shipped",
                shippedAt: new Date(),
                githubPrUrl: prUrl,
              },
            });
          }
        }

        console.log(`[GitHub Webhook] PR merged: ${prUrl}, updated ${linkedFeedback.length} feedback items`);
      }
    }

    // Handle new issues (could link feedback to GitHub issues)
    if (event === "issues" && payload.action === "opened") {
      const issue = payload.issue;
      const repoFullName = payload.repository.full_name;

      console.log(`[GitHub Webhook] New issue: ${issue.html_url}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
