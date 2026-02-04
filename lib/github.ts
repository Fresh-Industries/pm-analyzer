export async function getRepoDefaultBranch(repo: string) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
  const data = await response.json();
  return data.default_branch;
}

export async function createBranch(repo: string, fromBranch: string, newBranchName: string) {
  const token = process.env.GITHUB_TOKEN;
  // Get ref of fromBranch
  const refResponse = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${fromBranch}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!refResponse.ok) throw new Error(`GitHub API error: ${refResponse.statusText}`);
  const refData = await refResponse.json();
  const sha = refData.object.sha;

  // Create new branch
  const response = await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${newBranchName}`,
      sha,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    if (error.message !== 'Reference already exists') {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
  }
}

export async function addFileToPR(repo: string, branch: string, path: string, content: string) {
  const token = process.env.GITHUB_TOKEN;
  
  // Try to get existing file to get its SHA (if it exists)
  let sha;
  const getFileResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (getFileResponse.ok) {
    const fileData = await getFileResponse.json();
    sha = fileData.sha;
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update ${path}`,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha,
    }),
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
}

export async function createPR(repo: string, title: string, body: string, branch: string) {
  const token = process.env.GITHUB_TOKEN;
  const defaultBranch = await getRepoDefaultBranch(repo);
  
  const response = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body,
      head: branch,
      base: defaultBranch,
    }),
  });
  if (!response.ok) {
     const err = await response.json();
     throw new Error(`GitHub PR creation failed: ${err.message}`);
  }
  const data = await response.json();
  return data.html_url;
}
