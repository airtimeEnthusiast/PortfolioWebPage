// scripts/uploadLocalResume.js
// Read a local JSON resume file (scripts/local_resume.json) and upload it to Firestore
// at document `resume/profile`. This is intentionally simple and runs with a
// service account. Keep `scripts/local_resume.json` out of version control.
//
// Usage (locally):
//   export GOOGLE_APPLICATION_CREDENTIALS=~/.config/portfolio/serviceAccount.json
//   export FIREBASE_PROJECT_ID=your-project-id
//   node scripts/uploadLocalResume.js

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccount.json')
if (!fs.existsSync(keyPath)) {
  console.error('service account key not found at', keyPath)
  process.exit(1)
}

const serviceAccount = require(keyPath)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function main() {
  // If remote repo credentials are provided, attempt to fetch the JSON from the repo.
  const githubToken = process.env.REMOTE_GITHUB_TOKEN
  const repo = process.env.REMOTE_TEX_REPO // owner/repo
  const remotePath = process.env.REMOTE_TEX_PATH // path within repo
  const ref = process.env.REMOTE_TEX_BRANCH || 'main'

  let doc
  if (githubToken && repo && remotePath) {
    // Fetch via GitHub Contents API (raw)
    const [owner, repository] = repo.split('/')
    const apiUrl = `https://api.github.com/repos/${owner}/${repository}/contents/${encodeURIComponent(remotePath)}?ref=${ref}`
    console.log('Fetching resume JSON from GitHub API:', apiUrl)
    try {
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3.raw' } })
      if (!res.ok) {
        let msg = `${res.status} ${res.statusText}`
        try { const j = await res.json(); if (j && j.message) msg += ` - ${j.message}` } catch (_) {}
        throw new Error(`GitHub API fetch failed: ${msg}`)
      }
      const text = await res.text()
      try { doc = JSON.parse(text) } catch (err) {
        console.error('Downloaded remote file is not valid JSON:', err.message)
        process.exit(1)
      }
    } catch (err) {
      console.error('Failed to fetch resume JSON from GitHub:', err.message || err)
      process.exit(1)
    }
  } else {
    const localPath = path.join(__dirname, 'local_resume.json')
    if (!fs.existsSync(localPath)) {
      console.error('Local resume JSON not found at', localPath)
      console.error('Create the file `scripts/local_resume.json` and place your resume JSON there. This file is ignored by git.')
      process.exit(1)
    }

    console.log('Reading local resume JSON from', localPath)
    let raw
    try {
      raw = fs.readFileSync(localPath, 'utf8')
    } catch (err) {
      console.error('Failed to read local resume JSON:', err.message)
      process.exit(1)
    }

    try { doc = JSON.parse(raw) } catch (err) {
      console.error('Invalid JSON in local_resume.json:', err.message)
      process.exit(1)
    }
  }

  // Write to Firestore at resume/profile
  try {
    await db.doc('resume/profile').set({ data: doc, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
    console.log('Uploaded local resume JSON to Firestore at resume/profile')
  } catch (err) {
    console.error('Failed to write to Firestore:', err.message || err)
    process.exit(1)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
