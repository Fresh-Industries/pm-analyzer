export async function fetchIssues(org: string, project: string, token: string) {
  const response = await fetch(`https://sentry.io/api/0/projects/${org}/${project}/issues/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Sentry API error: ${response.statusText}`);
  return await response.json();
}

export function enrichError(error: any) {
  return {
    sentry_issue_id: error.id,
    sentry_issue_url: error.permalink,
    error_frequency: parseInt(error.count || '0', 10),
    title: error.title,
    culprit: error.culprit,
    lastSeen: error.lastSeen,
    firstSeen: error.firstSeen,
  };
}
