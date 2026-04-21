interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'noreply@tiendaonlineoficial.com'

  if (!apiKey) {
    console.log(`[email] EMAIL_API_KEY not set. Would send email to ${to}: ${subject}`)
    console.log(`[email] HTML preview: ${html.substring(0, 200)}...`)
    return false
  }

  try {
    // Try Resend API (most common for Vercel deployments)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Tienda Online Oficial <${fromEmail}>`,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Failed to send:', err)
      return false
    }

    console.log(`[email] Sent to ${to}: ${subject}`)
    return true
  } catch (err) {
    console.error('[email] Error:', err)
    return false
  }
}
