// scripts/fetchAndUploadTex.js
// Downloads a LaTeX file from a remote repo (raw URL) and uploads it to Firebase Storage,
// then updates Firestore at resume/profile with the file URL and timestamp.
// Usage:
//   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
//   export REMOTE_TEX_URL="https://raw.githubusercontent.com/owner/repo/branch/path/to/file.tex"
//   export FIREBASE_PROJECT_ID=your-project-id
//   node scripts/fetchAndUploadTex.js

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
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
})

const bucket = admin.storage().bucket()
const db = admin.firestore()

async function main() {
  const remoteUrl = process.env.REMOTE_TEX_URL || 'https://raw.githubusercontent.com/airtimeEnthusiast/Resume-Master/main/ATSAdmin/Austin_B_Wright_Resume.tex'
  console.log('Downloading', remoteUrl)

  const res = await fetch(remoteUrl)
  if (!res.ok) throw new Error(`Failed to download remote file: ${res.status} ${res.statusText}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileName = path.basename(new URL(remoteUrl).pathname)
  const destPath = `resumes/${fileName}`

  console.log('Uploading to Firebase Storage as', destPath)
  const file = bucket.file(destPath)
  await file.save(buffer, { contentType: 'application/x-tex' })
  // make public (optional)
  try {
    await file.makePublic()
  } catch (err) {
    console.warn('makePublic failed (check permissions):', err.message)
  }

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`

  // Update Firestore doc
  await db.doc('resume/profile').set({ texUrl: publicUrl, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

  console.log('Done. File available at', publicUrl)
}

main().catch(err => { console.error(err); process.exit(1) })
