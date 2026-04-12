// scripts/uploadResume.js
// Simple Node script to upload resume.json to Firestore using Admin SDK.
// Usage:
//   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
//   node scripts/uploadResume.js

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccount.json')
if (!fs.existsSync(keyPath)) {
  console.error('service account key not found at', keyPath)
  process.exit(1)
}

const serviceAccount = require(keyPath)
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

const db = admin.firestore()

async function main() {
  const resumePath = path.join(process.cwd(), 'scripts', 'resume.json')
  if (!fs.existsSync(resumePath)) {
    console.error('resume.json not found at', resumePath)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(resumePath, 'utf8'))
  // add an updatedAt timestamp
  data.updatedAt = admin.firestore.FieldValue.serverTimestamp()

  await db.doc('resume/profile').set(data, { merge: true })
  console.log('Resume uploaded to resume/profile')
}

main().catch((err) => { console.error(err); process.exit(1) })
