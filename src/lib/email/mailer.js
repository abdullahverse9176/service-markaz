import nodemailer from "nodemailer";
import { subjectLabelMap } from "@/lib/contact/constants";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string, replyTo?: string }} options
 */
export async function sendEmail({ to, subject, html, replyTo }) {
  return transporter.sendMail({
    from: `"Service Markaz" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}

// ── Email Templates ────────────────────────────────────────────────────────────

const wrapperStyle = `
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const baseStyle = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
`;

const headerStyle = `
  background: #00a676;
  padding: 20px 20px;
  color: #ffffff;
  text-align: center;
`;

const bodyStyle = `
  padding: 32px 20px;
  color: #374151;
  line-height: 1.6;
  font-size: 14px;
`;

const footerStyle = `
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  padding: 24px 20px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
`;

const labelStyle = `
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin: 0 0 6px 0;
`;

const valueStyle = `
  font-size: 14px;
  color: #111827;
  margin: 0 0 20px 0;
  word-break: break-word;
`;

/**
 * Email sent to admin when a new contact message is received.
 */
export function adminNotificationTemplate({ name, email, phone, subject, message }) {
  const subjectLabel = subjectLabelMap[subject] ?? subject;

  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">New Contact Message</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Support Inbox</p>
      </div>
      <div style="${bodyStyle}">
        <p style="${labelStyle}">Name</p>
        <p style="${valueStyle}">${escapeHtml(name)}</p>

        <p style="${labelStyle}">Email</p>
        <p style="${valueStyle}"><a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;">${escapeHtml(email)}</a></p>

        <p style="${labelStyle}">Phone</p>
        <p style="${valueStyle}">${phone ? escapeHtml(phone) : '—'}</p>

        <p style="${labelStyle}">Subject</p>
        <p style="${valueStyle}">${escapeHtml(subjectLabel)}</p>

        <p style="${labelStyle}">Message</p>
        <div style="background:#f3f4f6; border:4px solid #7c3aed; border-radius:6px; padding:14px 16px; font-size:15px; color:#111827; white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>
      <div style="${footerStyle}">
        Service Markaz Admin Panel &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * Auto-reply email sent to the user who submitted the contact form.
 */
export function autoReplyTemplate({ name, subject }) {
  const subjectLabel = subjectLabelMap[subject] ?? subject;

  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">We Got Your Message!</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz Support</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Thank you for reaching out to us. We have received your message regarding <strong>${escapeHtml(subjectLabel)}</strong> and our team will review it shortly.</p>
        <p>We typically respond within <strong>24 hours</strong> during business days (Mon – Sat, 9 AM – 6 PM).</p>
        <p style="margin-top:24px; color:#6b7280; font-size:14px;">If your query is urgent, feel free to reach out again. Please do not reply to this email — this is an automated message.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * Reply email sent to a user from the admin panel.
 */
export function adminReplyTemplate({ name, originalSubject, replyText }) {
  const subjectLabel = subjectLabelMap[originalSubject] ?? originalSubject;

  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">💬 Reply from Service Markaz</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Re: ${escapeHtml(subjectLabel)}</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Our support team has replied to your inquiry:</p>
        <div style="background:#f3f4f6; border:4px solid #7c3aed; border-radius:6px; padding:14px 16px; font-size:15px; color:#111827; white-space:pre-wrap; margin:16px 0;">${escapeHtml(replyText)}</div>
        <p style="font-size:14px; color:#6b7280;">If you have further questions, please visit our website and submit a new message.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * OTP verification email sent to user on signup or resend.
 */
export function otpEmailTemplate({ name, otp }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">🔐 Verify Your Email</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Account Verification</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Use the OTP below to verify your email address. This code expires in <strong>5 minutes</strong>.</p>
        <div style="text-align:center; margin:28px 0;">
          <div style="display:inline-block; background:#f5f3ff; border:2px solid #7c3aed; border-radius:12px; padding:15px 30px;">
            <p style="margin:0; font-size:25px; font-weight:800; letter-spacing:10px; color:#7c3aed;">${escapeHtml(otp)}</p>
          </div>
        </div>
        <p style="font-size:13px; color:#6b7280;">If you did not create an account on Service Markaz, you can safely ignore this email.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Rawalpindi, Punjab, Pakistan
      </div>
    </div>
  `;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * OTP email for password reset (forgot password flow).
 */
export function passwordResetOtpTemplate({ name, otp }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">Password Reset Request</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Account Security</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>We received a request to reset your password. Use the OTP below. This code expires in <strong>5 minutes</strong>.</p>
        <div style="text-align:center; margin:28px 0;">
          <div style="display:inline-block; background:#fef3c7; border:2px solid #d97706; border-radius:12px; padding:13px 25px;">
            <p style="margin:0; font-size:25px; font-weight:800; letter-spacing:10px; color:#d97706;">${escapeHtml(otp)}</p>
          </div>
        </div>
        <p style="font-size:13px; color:#6b7280;">If you did not request a password reset, please ignore this email. Your account is safe.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Rawalpindi, Punjab, Pakistan
      </div>
    </div>
  `;
}

/**
 * Email sent to provider when verification is submitted.
 */
export function verificationSubmittedTemplate({ name, businessName }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">✅ Verification Submitted</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Business Verification</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Your verification request for <strong>${escapeHtml(businessName)}</strong> has been successfully submitted!</p>
        <div style="background:#dbeafe; border-left:4px solid #3b82f6; border-radius:8px; padding:16px; margin:20px 0;">
          <p style="margin:0; font-size:14px; color:#1e40af;">
            <strong>What's Next?</strong><br/>
            Our team will review your documents within <strong>24-48 hours</strong>. You'll receive an email once your verification is approved or if we need any additional information.
          </p>
        </div>
        <p style="font-size:13px; color:#6b7280;">Thank you for choosing Service Markaz. Verified businesses get more visibility and customer trust!</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * Email sent to provider when verification is approved.
 */
export function verificationApprovedTemplate({ name, businessName }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">🎉 Verification Approved!</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Business Verification</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Congratulations! Your business <strong>${escapeHtml(businessName)}</strong> has been successfully verified! 🎊</p>
        <div style="background:#dcfce7; border-left:4px solid #16a34a; border-radius:8px; padding:16px; margin:20px 0;">
          <p style="margin:0 0 12px 0; font-size:14px; color:#166534;">
            <strong>Benefits of Being Verified:</strong>
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; color:#166534;">
            <li>Verified badge on your profile</li>
            <li>Higher visibility in search results</li>
            <li>Increased customer trust and credibility</li>
            <li>Priority support from our team</li>
          </ul>
        </div>
        <p>Your verified badge is now visible on your profile. Start getting more customers today!</p>
        <div style="text-align:center; margin:24px 0;">
          <a href="https://servicemarkaz.com/provider-profile" style="display:inline-block; background:#00a676; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:14px;">View My Profile</a>
        </div>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * Email sent to provider when verification is rejected.
 */
export function verificationRejectedTemplate({ name, businessName, reason }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">❌ Verification Rejected</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Business Verification</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>Unfortunately, your verification request for <strong>${escapeHtml(businessName)}</strong> has been rejected.</p>
        <div style="background:#fee2e2; border-left:4px solid #dc2626; border-radius:8px; padding:16px; margin:20px 0;">
          <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#991b1b;">REASON FOR REJECTION:</p>
          <p style="margin:0; font-size:14px; color:#991b1b;">${escapeHtml(reason)}</p>
        </div>
        <p>Don't worry! You can resubmit your verification with corrected documents.</p>
        <div style="text-align:center; margin:24px 0;">
          <a href="https://servicemarkaz.com/verify-business" style="display:inline-block; background:#dc2626; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:14px;">Resubmit Documents</a>
        </div>
        <p style="font-size:13px; color:#6b7280;">If you have any questions, please contact our support team.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

/**
 * Email sent to provider when resubmission is required.
 */
export function verificationResubmissionTemplate({ name, businessName, reason }) {
  return `
    <div style="${wrapperStyle}">
      <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0; font-size:20px; font-weight:700;">⚠️ Resubmission Required</h1>
        <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Service Markaz — Business Verification</p>
      </div>
      <div style="${bodyStyle}">
        <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
        <p>We've reviewed your verification request for <strong>${escapeHtml(businessName)}</strong> and need you to resubmit some documents.</p>
        <div style="background:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px; padding:16px; margin:20px 0;">
          <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#92400e;">WHAT NEEDS TO BE CORRECTED:</p>
          <p style="margin:0; font-size:14px; color:#92400e;">${escapeHtml(reason)}</p>
        </div>
        <p>Please review the feedback above and resubmit your documents with the necessary corrections.</p>
        <div style="text-align:center; margin:24px 0;">
          <a href="https://servicemarkaz.com/verify-business" style="display:inline-block; background:#f59e0b; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:14px;">Resubmit Documents</a>
        </div>
        <p style="font-size:13px; color:#6b7280;">We're here to help! If you need clarification, contact our support team.</p>
      </div>
      <div style="${footerStyle}">
        &copy; ${new Date().getFullYear()} Service Markaz &bull; Islamabad, Pakistan
      </div>
    </div>
  `;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
