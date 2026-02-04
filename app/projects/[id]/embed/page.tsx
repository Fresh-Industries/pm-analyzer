import { authClient } from "@/lib/auth-client";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authClient.getSession();
  if (!session?.data?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id, userId: session.data.user.id },
  });

  if (!project) {
    redirect("/dashboard");
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://pm-analyzer.dev";

  const embedCode = `<!-- PM Analyzer Feedback Widget -->
<script src="${origin}/widget.js" data-project-id="${project.id}" data-origin="${origin}" data-button-color="#2563eb"></script>

<!-- Optional custom buttons -->
<button data-pma-widget="feedback">Give Feedback</button>
<button data-pma-widget="bug">Report a Bug</button>`;

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
          <h1 className="text-2xl font-bold mb-2">Embed Feedback Widget</h1>
          <p className="text-gray-600 mb-6">
            Add a feedback button to your website to collect customer feedback and
            bug reports automatically.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  Your widget will look like this:
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                    Give Feedback
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium">
                    Report Bug
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Embed Code</h2>
              <p className="text-sm text-gray-500 mb-2">
                Add this code to your website:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Copy to Clipboard
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Options</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="custom-color"
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="custom-color" className="text-sm">
                    Custom colors (requires additional config)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="email-required"
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="email-required" className="text-sm">
                    Make email optional (recommended)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Supported Platforms</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Any HTML website</li>
                <li>✓ React/Vue/Angular apps</li>
                <li>✓ WordPress (via custom HTML block)</li>
                <li>✓ Notion pages (via embed)</li>
                <li>✓ Webflow (via embed element)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
