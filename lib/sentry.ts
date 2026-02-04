type SentryConfig = {
  org: string;
  project: string;
  token: string;
};

export async function fetchIssues(org: string, project: string, token: string) {
  const response = await fetch(`https://sentry.io/api/0/projects/${org}/${project}/issues/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Sentry API error: ${response.statusText}`);
  return await response.json();
}

export async function fetchSentryIssues(config: SentryConfig) {
  return fetchIssues(config.org, config.project, config.token);
}

export function enrichError(error: any) {
  return {
    sentryIssueId: error.id,
    sentryIssueUrl: error.permalink,
    errorFrequency: parseInt(error.count || "0", 10),
    affectedUsers: parseInt(error.userCount || "0", 10),
    title: error.title,
    culprit: error.culprit,
    lastSeen: error.lastSeen,
    firstSeen: error.firstSeen,
  };
}

export async function enrichSentryIssue(config: SentryConfig, issue: any) {
  const response = await fetch(
    `https://sentry.io/api/0/projects/${config.org}/${config.project}/issues/${issue.id}/events/latest/`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    }
  );

  let stackTrace = "";
  if (response.ok) {
    const event = await response.json();
    const exception = event?.exception?.values?.[0];
    const frames = exception?.stacktrace?.frames || [];
    stackTrace = frames
      .slice(-5)
      .map((frame: any) => `${frame.filename}:${frame.lineno} ${frame.function || ""}`)
      .join("\n");
  }

  return {
    frequency: parseInt(issue.count || "0", 10),
    affectedUsers: parseInt(issue.userCount || "0", 10),
    stackTrace,
  };
}
