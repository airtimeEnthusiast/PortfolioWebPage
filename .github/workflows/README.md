# Resume publish workflow — quick notes

This workflow fetches the `resume.json` from a remote GitHub repo and updates `resume/profile` in Firestore.

Secrets required (Repository → Settings → Secrets and variables → Actions):
- `FIREBASE_SA` — the entire service account JSON file contents (value = JSON).
- `FIREBASE_PROJECT_ID` — your Firebase project id.
- `REMOTE_TEX_REPO` — repository containing the resume JSON (example: `airtimeEnthusiast/Resume-Master`).
- `REMOTE_TEX_PATH` — path to the resume JSON inside the repo (example: `ATSFriendly/resume.json`).
- `REMOTE_TEX_BRANCH` — branch to fetch from (example: `main`).
- `REMOTE_GITHUB_TOKEN` — personal access token with `repo` scope if `Resume-Master` is private.

Local run

1. Place the Firebase service account JSON somewhere safe, for example `~/.config/portfolio/serviceAccount.json`.
2. Lock permissions: `chmod 600 ~/.config/portfolio/serviceAccount.json`.
3. In your shell run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/portfolio/serviceAccount.json"
export FIREBASE_PROJECT_ID="your-firebase-project-id"
export REMOTE_TEX_REPO="airtimeEnthusiast/Resume-Master"
export REMOTE_TEX_PATH="ATSFriendly/resume.json"
export REMOTE_TEX_BRANCH="main"
export REMOTE_GITHUB_TOKEN="your_github_pat"   # required if Resume-Master is private

npm run upload:local
```

This script is remote-only. It no longer falls back to `scripts/local_resume.json`.

CI / GitHub

Add the same values as GitHub Actions secrets, then run the workflow manually from GitHub:
Actions → Publish Resume from Remote → Run workflow.

Notes
- The workflow writes the `FIREBASE_SA` secret to a temporary `serviceAccount.json` on the runner and removes it after the job.
- Never commit service account JSON to the repository.
