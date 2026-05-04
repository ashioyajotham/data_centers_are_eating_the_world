/**
 * Optional email when a public suggestion is queued (Resend HTTP API — no extra npm deps).
 * Set RESEND_API_KEY, RESEND_FROM_EMAIL (verified sender), ADMIN_NOTIFY_EMAIL (comma-separated).
 */
export async function notifyAdminsNewPublicSubmission(
  candidateId: string,
  summaryLines: string[]
): Promise<void> {
  const recipients = (process.env.ADMIN_NOTIFY_EMAIL || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const appUrl =
    process.env.PUBLIC_APP_URL?.trim() ||
    process.env.FRONTEND_ORIGIN?.split(',')[0]?.trim() ||
    ''

  if (!key || !from || recipients.length === 0) {
    console.info(
      '[ingestion/suggest] Email skipped — set RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_NOTIFY_EMAIL to notify admins'
    )
    return
  }

  const adminLink = appUrl ? `${appUrl.replace(/\/$/, '')}/admin` : 'Open the Admin page in your deployed app.'
  const text = [
    'A new public data center suggestion was submitted and is pending approval.',
    '',
    ...summaryLines,
    '',
    `Candidate ID: ${candidateId}`,
    `Review: ${adminLink}`,
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `[Data centers map] New public suggestion (${candidateId.slice(0, 8)}…)`,
      text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[ingestion/suggest] Resend failed:', res.status, body)
  }
}
