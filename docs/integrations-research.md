# PM Analyzer Integrations + Widget Research

## 1) Sentry Integration (Bug Finder)

### Recommended approach
**Primary ingestion:** Sentry Issues API (polling) + Issue webhooks (real-time). Use polling as the reliable baseline; webhooks to reduce latency.

### APIs (Sentry)
- **List issues (org scope):** `GET /api/0/organizations/{org_slug}/issues/?project={project_id_or_slug}&query=...&sort=...`
  - Returns groups (issues) with fields like: `id`, `shortId`, `title` (metadata.title), `culprit`, `level`, `status`, `firstSeen`, `lastSeen`, `count` (event count), `userCount`, `permalink`.
- **Retrieve issue details:** `GET /api/0/organizations/{org_slug}/issues/{issue_id}/`
  - Includes metadata and summary info.
- **Latest event for stack trace:** `GET /api/0/issues/{issue_id}/events/latest/`
  - Gives event payload with exceptions, stacktrace, tags, device, OS, etc.
- **Events search (optional enrichment):** `GET /api/0/organizations/{org_slug}/events/?project=...&query=...`
  - Can be used for richer context if needed.

**Useful filters:**
- `query=is:unresolved` to focus on open issues.
- `query=event.type:error` if you want to avoid non-error event types.
- `sort=freq` or `sort=new` for prioritization.

### Webhooks (Sentry Integration Platform)
- **Issue webhooks** (recommended): triggers on issue created/updated/resolved/unresolved/ignored.
  - Gives issue payload with metadata + counts.
- **Issue alert webhooks** (optional): triggers only for alert rules; use for high-severity gating.
- Validate signature using **Sentry-Hook-Signature** (HMAC with integration signing secret).

### Data mapping → Feedback item
**Feedback fields (suggested):**
- `source`: `sentry`
- `external_id`: Sentry issue `id` or `shortId`
- `title`: `metadata.title` or `title`
- `description`: `culprit` + high-level summary
- `stack_trace`: extracted from `events/latest` → `exception.values[].stacktrace.frames`
- `frequency`: `count`
- `affected_users`: `userCount`
- `first_seen`, `last_seen`
- `severity`: from `level` (`error`, `fatal`, `warning`)
- `link`: `permalink`
- `tags/context`: environment, release, browser, OS, user, etc.

### Deduping & idempotency
- Use `external_id` as a unique key to avoid duplicate feedback.
- Update existing feedback when issue status changes or counts increase.

### Auth scopes
- Token scopes typically needed: `org:read`, `project:read`, `event:read`.

---

## 2) GitHub Integration

### Recommended approach
**Use a GitHub App** for multi-tenant and long-term safety. Use PAT only for early single-tenant dev.

### APIs (GitHub)
- **Create issue:** `POST /repos/{owner}/{repo}/issues`
  - Payload: `title`, `body`, `labels`, `assignees`.
- **Update issue (link to feedback, status changes):** `PATCH /repos/{owner}/{repo}/issues/{issue_number}`
- **Search or link PRs:** search by feedback ID in PR body/branch naming.

### Webhooks (GitHub)
- **Pull Request merged:** `pull_request` event with `action=closed` and `pull_request.merged=true`.
  - Use to mark feedback as **shipped**.
- **Issue events:** `issues` event if you want to sync issue status.
- Validate signature using `X-Hub-Signature-256` HMAC secret.

### Linking feedback ↔ PRs
- Embed a **feedback ID** in PR body or branch name (e.g., `feedback-1234`), or add a custom label.
- Store GitHub issue/PR URLs in feedback record for traceability.

### GitHub App vs PAT
**GitHub App (recommended):**
- Works across multiple repos/orgs.
- Fine-grained permissions.
- Uses installation tokens.

**PAT (fastest to start):**
- Single-user scope.
- Risky for multi-tenant or production.

---

## 3) Embeddable Widget Architecture

### Recommended approach
**Script tag loader + iframe modal**.
- **Script tag** injects a floating button and opens an **iframe modal** for the form.
- Iframe isolates CSS and JS from host site and avoids conflicts.

### Communication
- Use `postMessage` between iframe ↔ host loader.
- Validate `origin` on both sides.

### Customization
- Use `data-` attributes or query params for:
  - primary color, position, label text
  - “Give Feedback” vs “Report Bug” buttons
  - light/dark mode
- Example:
  ```html
  <script src="https://cdn.pmanalyzer.com/widget.js"
          data-project="proj_123"
          data-theme="dark"
          data-primary="#4F46E5"
          data-buttons="feedback,bug"
          data-position="right">
  </script>
  ```

### Form content (iframe)
- Provide two modes: **feedback** and **bug**.
- Include fields: summary, description, severity, screenshot, URL, user email.
- Capture context: page URL, browser/OS, time.

### Delivery strategy
- **CDN hosted** script (fast, easy to embed).
- **Self-host** option for enterprise security.

### Security notes
- CSP: allowlist the widget origin.
- Iframe `sandbox` mode (allow-forms, allow-scripts, allow-same-origin as needed).
- Rate-limit submissions; optional CAPTCHA for public forms.

---

## 4) Automated Bug Fixer (Advanced)

### Approach
- **Scheduled job** (cron) to check high-severity Sentry issues.
- Use confidence gates before auto-triggering the coding agent.

### Confidence thresholds (recommended)
- Only auto-fix if:
  - **Severity = error/fatal**
  - **Frequency** > X in last 24h (e.g., > 50)
  - **Affected users** > Y (e.g., > 10)
  - Agent confidence ≥ 0.75 (or model-based self-eval)
  - Tests pass on proposed patch

### Safety rails
- Always open PR on a new branch (no direct pushes).
- Require human approval before merge (even if PR is auto-created).
- Limit to a max of N PRs/day to avoid noisy churn.

---

## 5) Implementation Roadmap (Priority)

1. **Sentry Integration (Polling + Webhooks)**
   - Highest impact for bug detection and automated feedback.
2. **GitHub Integration (Issue creation + PR merge webhooks)**
   - Enables feedback → issue tracking and shipped status.
3. **Embeddable Widget**
   - Acquisition channel; enables direct customer input.
4. **Automated Bug Fixer (Pilot)**
   - Advanced and risky; start as opt-in beta.

---

## 6) Environment Variables

### Sentry
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_WEBHOOK_SECRET`

### GitHub
- **If GitHub App:**
  - `GITHUB_APP_ID`
  - `GITHUB_PRIVATE_KEY`
  - `GITHUB_WEBHOOK_SECRET`
- **If PAT (dev):**
  - `GITHUB_PAT`

### Widget
- `WIDGET_BASE_URL` (iframe host)
- `WIDGET_CDN_URL` (script host)
- `WIDGET_ALLOWED_ORIGINS`

### General
- `APP_PUBLIC_URL` (for webhook callbacks, PR links)
