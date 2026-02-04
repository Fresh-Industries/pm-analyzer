// pm-analyzer/lib/api.ts

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  githubRepo?: string | null;
  sentryOrg?: string | null;
  sentryProject?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    feedback: number;
  };
};

export type Feedback = {
  id: string;
  text: string;
  source?: string | null;
  type?: 'bug' | 'feature' | null;
  customerTier?: string | null;
  revenue?: number | null;
  status: 'pending_analysis' | 'analyzed' | 'ready_for_implementation' | 'shipped' | 'failed';
  githubPrUrl?: string | null;
  githubIssueUrl?: string | null;
  sentryIssueId?: string | null;
  sentryIssueUrl?: string | null;
  errorFrequency?: number | null;
  spec?: any;
  pageUrl?: string | null;
  browserInfo?: string | null;
  shippedAt?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Job = {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function uploadFeedback(projectId: string, file: File): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);

  const res = await fetch('/api/feedback/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload feedback');
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<Job> {
  const res = await fetch(`/api/feedback/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return res.json();
}

export async function submitFeedback(data: {
  projectId: string;
  type: string;
  source: string;
  text: string;
  email?: string;
  tier?: string;
  pageUrl?: string;
  browserInfo?: string;
}) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function syncSentry(projectId: string) {
  const res = await fetch('/api/integrations/sentry/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) throw new Error('Failed to sync Sentry');
  return res.json();
}
