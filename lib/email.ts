import type { License, ApprovalPayload } from "./types"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  type: string
  originalRecipient?: string
  recipientRole?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...options,
        originalRecipient: options.originalRecipient || options.to,
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export function generateCEOApprovalEmail(license: License, magicLink: string): string {
  const payload = license.approval_payload
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
        License Request Pending Your Approval
      </h2>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #334155; margin-top: 0;">Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Ticket ID:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.ticket_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Client:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.client}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Product:</td>
            <td style="padding: 8px 0;">${license.product}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Environment:</td>
            <td style="padding: 8px 0;">${license.environment}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Requested By:</td>
            <td style="padding: 8px 0;">${license.am_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">License Type:</td>
            <td style="padding: 8px 0;">${payload.license_type || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Contract Period:</td>
            <td style="padding: 8px 0;">${payload.contract_period || "N/A"}</td>
          </tr>
        </table>
      </div>
      
      ${payload.mac_id || payload.motherboard_serial_no || payload.processor_id || payload.c_drive_serial_no ? `
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #334155; margin-top: 0;">Hardware Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${payload.mac_id ? `<tr><td style="padding: 6px 0; color: #64748b; width: 40%;">MAC ID:</td><td style="padding: 6px 0; font-family: monospace;">${payload.mac_id}</td></tr>` : ""}
          ${payload.motherboard_serial_no ? `<tr><td style="padding: 6px 0; color: #64748b;">Motherboard S/N:</td><td style="padding: 6px 0; font-family: monospace;">${payload.motherboard_serial_no}</td></tr>` : ""}
          ${payload.processor_id ? `<tr><td style="padding: 6px 0; color: #64748b;">Processor ID:</td><td style="padding: 6px 0; font-family: monospace;">${payload.processor_id}</td></tr>` : ""}
          ${payload.c_drive_serial_no ? `<tr><td style="padding: 6px 0; color: #64748b;">C Drive S/N:</td><td style="padding: 6px 0; font-family: monospace;">${payload.c_drive_serial_no}</td></tr>` : ""}
        </table>
      </div>
      ` : ""}
      
      ${payload.no_of_pages || payload.no_of_documents ? `
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #334155; margin-top: 0;">Document Metrics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${payload.no_of_pages ? `<tr><td style="padding: 6px 0; color: #64748b; width: 40%;">No. of Pages:</td><td style="padding: 6px 0;">${payload.no_of_pages}</td></tr>` : ""}
          ${payload.no_of_documents ? `<tr><td style="padding: 6px 0; color: #64748b;">No. of Documents:</td><td style="padding: 6px 0;">${payload.no_of_documents}</td></tr>` : ""}
        </table>
      </div>
      ` : ""}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Review & Approve Request
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        This is an automated email from LicenseIQ - Antworks License Management System.<br/>
        If you did not request this, please ignore this email.
      </p>
    </div>
  `
}

export function generateLicenseCreatedEmail(license: License): string {
  const payload = license.approval_payload
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
        License Request Created Successfully
      </h2>
      
      <p style="color: #334155;">Your license request has been submitted and is now ${license.status === "Pending CEO" ? "awaiting CEO approval" : "in the license team queue"}.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #334155; margin-top: 0;">Request Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Ticket ID:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.ticket_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Client:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.client}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Product:</td>
            <td style="padding: 8px 0;">${license.product}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Environment:</td>
            <td style="padding: 8px 0;">${license.environment}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Status:</td>
            <td style="padding: 8px 0;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${license.status}</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        This is an automated email from LicenseIQ - Antworks License Management System.
      </p>
    </div>
  `
}

export function generateLicenseActivatedEmail(license: License): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
        License Activated Successfully
      </h2>
      
      <p style="color: #334155;">Great news! Your license request has been processed and activated.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
        <h3 style="color: #166534; margin-top: 0;">License Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Ticket ID:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.ticket_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Client:</td>
            <td style="padding: 8px 0; font-weight: bold;">${license.client}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Product:</td>
            <td style="padding: 8px 0;">${license.product}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Environment:</td>
            <td style="padding: 8px 0;">${license.environment}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Processed By:</td>
            <td style="padding: 8px 0;">${license.shared_by_name || "License Team"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Status:</td>
            <td style="padding: 8px 0;"><span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
          </tr>
        </table>
      </div>
      
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        This is an automated email from LicenseIQ - Antworks License Management System.
      </p>
    </div>
  `
}
