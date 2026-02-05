import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, description: true },
  });

  if (!project) {
    notFound();
  }

  // Redirect to decisions as primary view
  redirect(`/projects/${id}/decisions`);
}
