import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params as any);
    const pathId = new URL(req.url).pathname.split("/").filter(Boolean).pop();
    const feedbackId = resolvedParams?.id || (pathId && pathId !== "feedback" ? pathId : "");
    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
