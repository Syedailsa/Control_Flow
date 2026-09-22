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

// Brand colors
const BRAND = {
  primary: "#4f46e5",      // indigo-600
  primaryDark: "#4338ca",  // indigo-700
  gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  bg: "#f8fafc",           // slate-50
  bgAccent: "#eef2ff",     // indigo-50
  border: "#e0e7ff",       // indigo-100
  text: "#1e293b",         // slate-800
  textMuted: "#64748b",    // slate-500
  textLight: "#94a3b8",    // slate-400
  white: "#ffffff",
}

function baseLayout(content: string, leadName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND.gradient};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:${BRAND.white};font-size:26px;font-weight:700;letter-spacing:-0.5px;">CoachFlow AI</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:0.5px;">LEAD AUTOMATION &amp; COACHING</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:${BRAND.text};font-size:15px;line-height:1.7;">Hi ${leadName || "there"},</p>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${BRAND.border};text-align:center;background:${BRAND.bg};">
              <p style="margin:0 0 8px;color:${BRAND.textMuted};font-size:12px;">
                CoachFlow AI · Lead Automation &amp; Coaching
              </p>
              <p style="margin:0;color:${BRAND.textLight};font-size:11px;">
                You received this because you connected with us through our website.<br>
                <a href="#" style="color:${BRAND.primary};text-decoration:underline;">Unsubscribe</a>
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
  return `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;line-height:1.7;">${text}</p>`
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td>
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:${BRAND.gradient};color:${BRAND.white};text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;box-shadow:0 4px 12px rgba(79,70,229,0.25);">${label}</a>
  </td></tr></table>`
}

function infoBox(rows: string): string {
  return `<table role="presentation" width="100%" style="background:${BRAND.bgAccent};border:1px solid ${BRAND.border};border-radius:12px;padding:20px;margin:0 0 24px;"><tr><td>
    ${rows}
  </td></tr></table>`
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:0 0 8px;color:${BRAND.textMuted};font-size:13px;"><strong style="color:${BRAND.text};">${label}:</strong> ${value}</p>`
}

function stepRow(number: string, text: string): string {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:28px;height:28px;background:${BRAND.gradient};border-radius:50%;text-align:center;vertical-align:middle;">
        <span style="color:${BRAND.white};font-size:12px;font-weight:700;">${number}</span>
      </td>
      <td style="padding-left:12px;color:${BRAND.text};font-size:14px;line-height:1.6;">${text}</td>
    </tr></table>
  </td></tr>`
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
        subject: "Welcome to CoachFlow — Let's Get Started",
        html: baseLayout(
          paragraph("Thank you for reaching out to CoachFlow! We're excited to help you automate your lead flow and grow your coaching business.") +
          paragraph("Here's what CoachFlow can do for you:") +
          `<table role="presentation" width="100%" style="margin:0 0 24px;">
            ${stepRow("1", "AI chat widget engages your website visitors 24/7")}
            ${stepRow("2", "Automatically qualifies and scores leads as HOT / WARM / COLD")}
            ${stepRow("3", "Books discovery calls on your Google Calendar — no back-and-forth")}
            ${stepRow("4", "Tracks everything in your CRM dashboard in real-time")}
          </table>` +
          paragraph("Ready to see it in action? Book a <strong>free 30-minute discovery call</strong> and we'll map out your custom lead flow.") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Book Your Free Discovery Call") +
          paragraph("Have questions? Just reply to this email — we're here to help.") +
          paragraph("Best,<br><strong>The CoachFlow Team</strong>"),
          name
        ),
      }

    case "CONFIRMATION":
      return {
        subject: `Confirmed: Your Discovery Call — ${callDate} at ${callTime}`,
        html: baseLayout(
          paragraph("Your free discovery call is officially booked! Here are the details:") +
          infoBox(
            infoRow("Date", callDate) +
            infoRow("Time", callTime) +
            infoRow("Duration", "30 minutes") +
            infoRow("Type", "Free — no obligation")
          ) +
          (meetLink ? paragraph(`Your meeting link: <a href="${meetLink}" style="color:${BRAND.primary};font-weight:600;text-decoration:underline;">${meetLink}</a>`) + button(meetLink, "Join the Call") : "") +
          (calendarLink ? button(calendarLink, "View in Calendar") : "") +
          paragraph("Need to reschedule? Just reply to this email and we'll take care of it.") +
          paragraph("We look forward to speaking with you!") +
          paragraph("Best,<br><strong>The CoachFlow Team</strong>"),
          name
        ),
      }

    case "REMINDER":
      return {
        subject: `Reminder: Your Discovery Call Today at ${callTime}`,
        html: baseLayout(
          paragraph("Quick reminder — your free discovery call is coming up soon:") +
          infoBox(
            infoRow("Date", callDate) +
            infoRow("Time", callTime) +
            infoRow("Duration", "30 minutes")
          ) +
          (meetLink ? button(meetLink, "Join the Call") : "") +
          paragraph("Have your goals and challenges in mind — we'll take care of the rest!") +
          paragraph("See you soon,<br><strong>The CoachFlow Team</strong>"),
          name
        ),
      }

    case "THANK_YOU":
      return {
        subject: "Thank You — Here's What Happens Next",
        html: baseLayout(
          paragraph("Thank you for taking the time to speak with us today! It was great learning about your goals.") +
          paragraph("Here's what happens next:") +
          `<table role="presentation" width="100%" style="margin:0 0 24px;">
            ${stepRow("1", "We'll prepare a tailored recommendation for your lead automation setup")}
            ${stepRow("2", "You'll receive it within 24–48 hours via email")}
            ${stepRow("3", "We'll schedule a follow-up to walk you through everything")}
          </table>` +
          paragraph("Questions in the meantime? Just reply to this email.") +
          paragraph("Best,<br><strong>The CoachFlow Team</strong>"),
          name
        ),
      }

    case "FOLLOWUP":
      return {
        subject: "We Missed You — Want to Reschedule?",
        html: baseLayout(
          paragraph("We noticed you weren't able to make your discovery call. No worries — life happens!") +
          paragraph("We'd still love to help you automate your lead flow and grow your business. Would you like to pick a new time?") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Reschedule Your Call") +
          paragraph("If the timing isn't right, that's completely fine. Just let us know and we'll be here when you're ready.") +
          paragraph("Best,<br><strong>The CoachFlow Team</strong>"),
          name
        ),
      }

    case "NURTURE":
      return {
        subject: "Quick Tip: Automate Your Lead Flow",
        html: baseLayout(
          paragraph("Hope you're doing well! We wanted to share a quick insight on how coaches are scaling their businesses with automation.") +
          `<table role="presentation" width="100%" style="background:${BRAND.bgAccent};border-left:3px solid ${BRAND.primary};border-radius:0 8px 8px 0;padding:20px;margin:0 0 24px;"><tr><td>
            <p style="margin:0;color:${BRAND.text};font-size:15px;line-height:1.7;font-style:italic;">"The biggest gap between where you are and where you want to be isn't knowledge — it's focused execution. Automate the repetitive work so you can focus on what matters."</p>
          </td></tr></table>` +
          paragraph("That's exactly what CoachFlow helps you do: capture leads, qualify them, book calls, and follow up — all automatically.") +
          paragraph("Whenever you're ready, we're here.") +
          button(calendarLink || "https://controlflow.27.jugaar.ai", "Book a Discovery Call") +
          paragraph("Best,<br><strong>The CoachFlow Team</strong>"),
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
