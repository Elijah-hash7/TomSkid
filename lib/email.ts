type SendEmailParams = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? "Tomskid <noreply@tomskid.com>"

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send")
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error("[email] Resend failed:", res.status, body)
    }
  } catch (err) {
    console.error("[email] send error:", err)
  }
}

type OrderNotificationParams = {
  orderId: string
  customerName: string
  customerEmail: string
  planName: string
  carrierName: string
  amount: string
  paymentReference: string
  imei: string
  eid: string
  phoneModel: string
  state: string
  zipCode: string
}

export function buildNewOrderEmail(params: OrderNotificationParams) {
  const {
    orderId,
    customerName,
    customerEmail,
    planName,
    carrierName,
    amount,
    paymentReference,
    imei,
    eid,
    phoneModel,
    state,
    zipCode,
  } = params

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #0a84ff; margin-bottom: 8px;">New order received</h2>
      <p style="color: #64748b; margin-top: 0;">A customer just submitted an order on Tomskid.</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Order summary</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b;">Order ID</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${orderId}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Carrier</td><td style="padding: 6px 0; text-align: right;">${carrierName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Plan</td><td style="padding: 6px 0; text-align: right;">${planName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Amount</td><td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0a84ff;">${amount}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Payment ref</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${paymentReference}</td></tr>
        </table>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Customer details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b;">Name</td><td style="padding: 6px 0; text-align: right;">${customerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; text-align: right;">${customerEmail}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Phone model</td><td style="padding: 6px 0; text-align: right;">${phoneModel}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">State</td><td style="padding: 6px 0; text-align: right;">${state}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">ZIP code</td><td style="padding: 6px 0; text-align: right;">${zipCode}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">IMEI</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${imei}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">EID</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${eid}</td></tr>
        </table>
      </div>

      <p style="color: #64748b; font-size: 13px;">Sign in to the admin dashboard to review the receipt and process this order.</p>
    </div>
  `.trim()

  return {
    subject: `New order from ${customerName} — ${carrierName} ${planName}`,
    html,
  }
}
