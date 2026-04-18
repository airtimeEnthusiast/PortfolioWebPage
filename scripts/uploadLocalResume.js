// scripts/uploadLocalResume.js
// Fetch a remote resume JSON file from GitHub and upload it to Firestore
// at document `resume/profile`. This script requires remote repo env vars
// and does not support reading a local fallback file.
//
// Usage (locally):
//   export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/portfolio/serviceAccount.json"
//   export FIREBASE_PROJECT_ID="your-firebase-project-id"
//   export REMOTE_TEX_REPO="airtimeEnthusiast/Resume-Master"
//   export REMOTE_TEX_PATH="ATSFriendly/resume.json"
//   export REMOTE_TEX_BRANCH="main"
//   export REMOTE_GITHUB_TOKEN="your_github_pat" # required if the repo is private
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
  const githubToken = process.env.REMOTE_GITHUB_TOKEN
  const repo = process.env.REMOTE_TEX_REPO // owner/repo
  const remotePath = process.env.REMOTE_TEX_PATH // path within repo
  const ref = process.env.REMOTE_TEX_BRANCH || 'main'

  if (!repo || !remotePath) {
    console.error('Missing required remote resume env vars.')
    console.error('Set REMOTE_TEX_REPO and REMOTE_TEX_PATH before running this script.')
    process.exit(1)
  }

  let doc
  const [owner, repository] = repo.split('/')
  const apiUrl = `https://api.github.com/repos/${owner}/${repository}/contents/${encodeURIComponent(remotePath)}?ref=${ref}`
  console.log('Fetching resume JSON from GitHub API:', apiUrl)
  try {
    const headers = {
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      Accept: 'application/vnd.github.v3.raw'
    }

    const res = await fetch(apiUrl, { headers })
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

  // Write to Firestore at resume/profile
  try {
    await db.doc('resume/profile').set({ data: doc, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
    console.log('Uploaded remote resume JSON to Firestore at resume/profile')
  } catch (err) {
    console.error('Failed to write to Firestore:', err.message || err)
    process.exit(1)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
