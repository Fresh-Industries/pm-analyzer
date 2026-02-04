import { createClient } from "@/lib/auth-client";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const auth = createClient();

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href={`/projects/${id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Project
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Project Settings</h1>

          <div className="space-y-8">
            {/* General Settings */}
            <div>
              <h2 className="text-lg font-semibold mb-4">General</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="w-full max-w-md px-3 py-2 border rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    defaultValue={project.description || ""}
                    className="w-full max-w-md px-3 py-2 border rounded-lg"
                    rows={3}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <hr />

            {/* GitHub Integration */}
            <div>
              <h2 className="text-lg font-semibold mb-4">GitHub Integration</h2>
              <p className="text-sm text-gray-500 mb-4">
                Connect your GitHub repository to automatically create PRs when
                features are built and track shipped items.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Repository URL
                  </label>
                  <input
                    type="text"
                    defaultValue={project.githubRepo || ""}
                    placeholder="https://github.com/owner/repo"
                    className="w-full max-w-md px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full repository URL or owner/repo format
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    Save GitHub Settings
                  </button>
                  {project.githubRepo && (
                    <span className="text-sm text-green-600">
                      ✓ Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr />

            {/* Sentry Integration */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Sentry Integration</h2>
              <p className="text-sm text-gray-500 mb-4">
                Connect Sentry to automatically import errors as bug reports and
                track issue frequency.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sentry Organization
                    </label>
                    <input
                      type="text"
                      defaultValue={project.sentryOrg || ""}
                      placeholder="my-org"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sentry Project
                    </label>
                    <input
                      type="text"
                      defaultValue={project.sentryProject || ""}
                      placeholder="my-project"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    defaultValue={project.sentryToken || ""}
                    placeholder="sentry auth token"
                    className="w-full max-w-md px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Create a token at https://sentry.io/settings/auth-tokens/
                    with org:read and project:read scopes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                    Save Sentry Settings
                  </button>
                  <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
                    Sync Issues Now
                  </button>
                  {project.sentryOrg && project.sentryProject && (
                    <span className="text-sm text-green-600">
                      ✓ Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr />

            {/* Embed Widget */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Embed Widget</h2>
              <p className="text-sm text-gray-500 mb-4">
                Get the embed code to add feedback buttons to your website.
              </p>
              <Link
                href={`/projects/${id}/embed`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Get Embed Code →
              </Link>
            </div>

            <hr />

            {/* Danger Zone */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Danger Zone
              </h2>
              <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
