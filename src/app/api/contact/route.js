import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import ContactMessage from "@/models/ContactMessage";
import { sendEmail, adminNotificationTemplate, autoReplyTemplate } from "@/lib/email/mailer";
import { subjectLabelMap } from "@/lib/contact/constants";

const ALLOWED_SUBJECTS = Object.keys(subjectLabelMap);

// POST /api/contact
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !subject || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return NextResponse.json(
        { success: false, message: "Invalid subject." },
        { status: 400 }
      );
    }

    if (message.trim().length < 20 || message.trim().length > 1000) {
      return NextResponse.json(
        { success: false, message: "Message must be between 20 and 1000 characters." },
        { status: 400 }
      );
    }

    // ── Save to database ──────────────────────────────────────────────────────
    await connectDB();
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject,
      message: message.trim(),
    });

    // ── Send emails (non-blocking — do not fail the request if email fails) ──
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailPromises = [];

    if (adminEmail) {
      emailPromises.push(
        sendEmail({
          to: adminEmail,
          subject: `New Contact Message: ${subjectLabelMap[subject]}`,
          html: adminNotificationTemplate({ name, email, phone, subject, message }),
          replyTo: email,
        }).catch((err) => console.error("Admin notification email failed:", err))
      );
    }

    emailPromises.push(
      sendEmail({
        to: email,
        subject: "We received your message — Service Markaz",
        html: autoReplyTemplate({ name, subject }),
      }).catch((err) => console.error("Auto-reply email failed:", err))
    );

    await Promise.all(emailPromises);

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
