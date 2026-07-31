import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

const HOST = process.env.SMTP_HOST || "smtp.gmail.com"
const PORT = parseInt(process.env.SMTP_PORT || "587")
const USER = process.env.SMTP_USER || ""
const PASS = process.env.SMTP_PASS || ""
const FROM = process.env.SMTP_FROM_EMAIL || USER

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    })
  }
  return transporter
}

export type EmailType =
  | "WELCOME"
  | "CONFIRMATION"
  | "REMINDER"
  | "FOLLOWUP"
  | "THANK_YOU"
  | "NURTURE"

interface EmailTemplate {
  subject: string
  html: string
}

function baseLayout(content: string, leadName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FEF9E7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#FF6B35 0%,#F7931E 30%,#FFD23F 70%,#FEF9E7 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(247,147,30,0.2);">
          <tr>
            <td style="background:linear-gradient(135deg,#FF6B35,#F7931E,#FFD23F);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:-0.5px;">CoachFlow AI</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Business &amp; Executive Coaching</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;">Hi ${leadName || "there"},</p>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F3E5C8;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                CoachFlow AI · Business &amp; Executive Coaching<br>
                You received this email because you connected with us through our website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;">${text}</p>`
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td>
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF6B35,#F7931E);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">${label}</a>
  </td></tr></table>`
}

export function getEmailTemplate(type: EmailType, data: Record<string, string>): EmailTemplate {
  const name = data.leadName || "there"
  const callDate = data.callDate || ""
  const callTime = data.callTime || ""
  const meetLink = data.meetLink || ""
  const calendarLink = data.calendarLink || ""

  switch (type) {
    case "WELCOME":
      return {
        subject: "Great to Connect! Let's Grow Together",
        html: baseLayout(
          paragraph("Thank you for reaching out to CoachFlow. We're genuinely excited about the opportunity to work with you!") +
          paragraph("As a next step, we'd love to schedule a <strong>free 30-minute discovery call</strong> where we'll discuss your goals, challenges, and whether our coaching programs are the right fit for you. No obligation — just a conversation.") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Book Your Free Discovery Call") +
          paragraph("In the meantime, feel free to reply to this email with any questions about our coaching programs.") +
          paragraph("Warm regards,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
    case "CONFIRMATION":
      return {
        subject: `Confirmed: Your Discovery Call — ${callDate} at ${callTime}`,
        html: baseLayout(
          paragraph("Great news — your free discovery call is officially booked! Here are the details:") +
          `<table role="presentation" width="100%" style="background:#FEF9E7;border:1px solid #F3E5C8;border-radius:12px;padding:20px;margin:0 0 24px;"><tr><td>
            <p style="margin:0 0 8px;color:#666;font-size:13px;"><strong>Date:</strong> ${callDate}</p>
            <p style="margin:0 0 8px;color:#666;font-size:13px;"><strong>Time:</strong> ${callTime}</p>
            <p style="margin:0;color:#666;font-size:13px;"><strong>Duration:</strong> 30 minutes</p>
          </td></tr></table>` +
          (meetLink ? paragraph(`Your meeting link: <a href="${meetLink}" style="color:#F7931E;font-weight:600;">${meetLink}</a>`) : "") +
          paragraph("A calendar invite is on its way with all the details. If you need to reschedule, just reply to this email and we'll take care of it.") +
          paragraph("We look forward to speaking with you soon!") +
          paragraph("Warm regards,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
    case "REMINDER":
      return {
        subject: `Reminder: Your Discovery Call Today at ${callTime}`,
        html: baseLayout(
          paragraph("Quick reminder — your free discovery call is happening soon:") +
          `<table role="presentation" width="100%" style="background:#FEF9E7;border:1px solid #F3E5C8;border-radius:12px;padding:20px;margin:0 0 24px;"><tr><td>
            <p style="margin:0 0 8px;color:#666;font-size:13px;"><strong>Date:</strong> ${callDate}</p>
            <p style="margin:0 0 8px;color:#666;font-size:13px;"><strong>Time:</strong> ${callTime}</p>
            <p style="margin:0;color:#666;font-size:13px;"><strong>Duration:</strong> 30 minutes</p>
          </td></tr></table>` +
          (meetLink ? button(meetLink, "Join the Call") : "") +
          paragraph("Make sure you're in a quiet spot and have your goals in mind. We'll take care of the rest!") +
          paragraph("See you soon,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
    case "THANK_YOU":
      return {
        subject: "Thank You — Next Steps",
        html: baseLayout(
          paragraph("Thank you for taking the time to speak with us today! It was a pleasure learning about your goals and challenges.") +
          paragraph("Based on our conversation, here's what happens next:") +
          `<table role="presentation" width="100%" style="margin:0 0 24px;"><tr><td style="padding:8px 0;color:#333;font-size:14px;">1. We'll prepare a tailored coaching recommendation for you</td></tr><tr><td style="padding:8px 0;color:#333;font-size:14px;">2. You'll receive it within 24-48 hours via email</td></tr><tr><td style="padding:8px 0;color:#333;font-size:14px;">3. We'll schedule a follow-up to answer any questions</td></tr></table>` +
          paragraph("If you have any questions in the meantime, don't hesitate to reply to this email.") +
          paragraph("Warm regards,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
    case "FOLLOWUP":
      return {
        subject: "We Didn't Get to Chat — Want to Reschedule?",
        html: baseLayout(
          paragraph("We noticed you weren't able to make your discovery call. No worries at all — life happens!") +
          paragraph("We'd still love to help you reach your goals. Would you like to pick a new time for your free 30-minute call?") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Reschedule Your Call") +
          paragraph("If coaching isn't the right fit right now, that's completely fine too — just let us know and we'll leave you be.") +
          paragraph("Warm regards,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
    case "NURTURE":
      return {
        subject: "Some Thoughts on Growing Your Business",
        html: baseLayout(
          paragraph("Hope you're doing well! We wanted to share a few quick insights on the challenges many business owners face when scaling — and how executive coaching can help.") +
          paragraph("<em>\"The biggest gap between where you are and where you want to be is often not knowledge — it's focused execution.\"</em>") +
          paragraph("That's exactly what we help leaders with: turning ambition into a clear, executable plan.") +
          paragraph("Whenever you're ready, we're here. A free discovery call is always a good place to start.") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Book a Discovery Call") +
          paragraph("Warm regards,<br><strong>Your CoachFlow Team</strong>"),
          name
        ),
      }
  }
}

export async function sendEmail(params: {
  to: string
  type: EmailType
  data: Record<string, string>
  leadId?: string
}): Promise<{ success: boolean; error?: string }> {
  const { to, type, data, leadId } = params

  if (!to) {
    return { success: false, error: "No recipient email" }
  }

  const template = getEmailTemplate(type, data)

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `CoachFlow AI <${FROM}>`,
      to,
      subject: template.subject,
      html: template.html,
    })

    if (leadId) {
      await prisma.emailLog.create({
        data: {
          leadId,
          type: type as "WELCOME" | "CONFIRMATION" | "REMINDER" | "FOLLOWUP" | "THANK_YOU" | "NURTURE",
          subject: template.subject,
          content: template.html,
          sentAt: new Date(),
          status: "SENT",
        },
      })
    }

    return { success: true }
  } catch (error) {
    const message = (error as Error).message

    if (leadId) {
      await prisma.emailLog.create({
        data: {
          leadId,
          type: type as "WELCOME" | "CONFIRMATION" | "REMINDER" | "FOLLOWUP" | "THANK_YOU" | "NURTURE",
          subject: template.subject,
          status: "FAILED",
          error: message,
        },
      })
    }

    return { success: false, error: message }
  }
}
