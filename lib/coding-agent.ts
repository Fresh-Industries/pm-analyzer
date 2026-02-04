export interface AgentSpec {
  title: string;
  summary: string;
  type: 'BUG' | 'FEATURE';
  details: any;
}

export interface AgentResult {
  prUrl: string;
  logs: string;
}

export async function runOpenHandsAgent(spec: AgentSpec, repoUrl: string): Promise<AgentResult> {
  const openHandsUrl = process.env.OPENHANDS_API_URL;
  
  if (!openHandsUrl) {
    console.warn("OPENHANDS_API_URL not set, mocking agent run");
    return {
      prUrl: "https://github.com/example/repo/pull/123",
      logs: "Mock execution logs...",
    };
  }

  try {
    const response = await fetch(`${openHandsUrl}/api/v1/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENHANDS_TOKEN}` // if needed
      },
      body: JSON.stringify({
        repo: repoUrl,
        task: `Implement the following spec:\n\n${JSON.stringify(spec, null, 2)}`,
        // Other OpenHands params
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenHands API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      prUrl: data.pr_url,
      logs: data.logs || "",
    };
  } catch (error) {
    console.error("Agent run failed:", error);
    throw error;
  }
}
