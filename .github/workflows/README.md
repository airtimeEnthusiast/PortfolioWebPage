# Resume publish workflow — quick notes

This workflow fetches your LaTeX resume from a remote repo and uploads it to Firebase Storage, then updates `resume/profile` in Firestore.

Secrets required (Repository → Settings → Secrets and variables → Actions):
- `FIREBASE_SA` — the entire service account JSON file contents (value = JSON).

Local run (recommended for testing)

1. Place the downloaded service account JSON from Firebase somewhere safe (example `~/.config/portfolio/serviceAccount.json`).
2. Lock permissions: `chmod 600 ~/.config/portfolio/serviceAccount.json`.
3. In your shell:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/portfolio/serviceAccount.json"
export FIREBASE_PROJECT_ID="your-firebase-project-id"
export REMOTE_TEX_URL="https://raw.githubusercontent.com/airtimeEnthusiast/Resume-Master/main/ATSAdmin/Austin_B_Wright_Resume.tex"
npm install
npm run fetch:tex
```

CI / GitHub (set secrets)

Use the GitHub UI (Settings → Secrets and variables → Actions) to add the three secrets above. Or use the `gh` CLI:

```bash
gh secret set FIREBASE_SA --body "$(cat serviceAccount.json)"
gh secret set FIREBASE_PROJECT_ID --body "your-firebase-project-id"
gh secret set REMOTE_TEX_URL --body "https://raw.githubusercontent.com/airtimeEnthusiast/Resume-Master/main/ATSAdmin/Austin_B_Wright_Resume.tex"
```

Run the workflow manually from GitHub: Actions → Publish Resume from Remote → Run workflow.

Notes
- The workflow writes the `FIREBASE_SA` secret to a temporary `serviceAccount.json` on the runner. It is removed after the job.
- Never commit service account JSON to the repository. This repo already ignores `serviceAccount.json`.
- If you want stronger security, I can help configure Workload Identity Federation (OIDC) so no JSON secret is needed.

Lockfile note
- For reproducible installs in CI, consider committing your package-lock.json (run `npm install` locally and commit the generated lockfile). The workflow uses `npm install` when a lockfile is missing.
