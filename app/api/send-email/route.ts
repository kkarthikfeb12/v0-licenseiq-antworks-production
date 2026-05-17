import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_gHLyjyKx_6VGCgQveEZyvUVGoCpHkdPK8")

// Override email - all emails go to this address for testing
const OVERRIDE_EMAIL = "kkarthikfeb12@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, type, originalRecipient, recipientRole } = body

    // Build email body that preserves original recipient info
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            <strong>Original Recipient:</strong> ${originalRecipient || to}<br/>
            <strong>Role:</strong> ${recipientRole || "N/A"}<br/>
            <strong>Email Type:</strong> ${type || "General"}
          </p>
        </div>
        ${html}
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: "LicenseIQ <onboarding@resend.dev>",
      to: [OVERRIDE_EMAIL],
      subject: `[LicenseIQ] ${subject}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    )
  }
}
