import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import ContactMessage from "@/models/ContactMessage";
import { sendEmail, adminReplyTemplate } from "@/lib/email/mailer";
import { subjectLabelMap } from "@/lib/contact/constants";

function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PATCH /api/admin/messages/[id]  — mark read/unread OR send reply
export async function PATCH(request, { params }) {
  const { id } = await params;
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isValidId(id)) {
    return NextResponse.json({ success: false, message: "Invalid message ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    await connectDB();

    const msg = await ContactMessage.findById(id);
    if (!msg) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    // ── Reply ────────────────────────────────────────────────────────────────
    if (body.action === "reply") {
      const replyText = body.replyText?.trim();
      if (!replyText || replyText.length < 5) {
        return NextResponse.json(
          { success: false, message: "Reply text is required (min 5 characters)." },
          { status: 400 }
        );
      }

      await sendEmail({
        to: msg.email,
        subject: `Re: ${subjectLabelMap[msg.subject] ?? msg.subject} — Service Markaz`,
        html: adminReplyTemplate({
          name: msg.name,
          originalSubject: msg.subject,
          replyText,
        }),
      });

      // Mark as read after replying
      msg.status = "read";
      await msg.save();

      return NextResponse.json({ success: true, message: "Reply sent successfully." });
    }

    // ── Toggle read/unread ───────────────────────────────────────────────────
    if (body.status === "read" || body.status === "unread") {
      msg.status = body.status;
      await msg.save();
      return NextResponse.json({ success: true, data: msg });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/messages/[id] error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/admin/messages/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isValidId(id)) {
    return NextResponse.json({ success: false, message: "Invalid message ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const msg = await ContactMessage.findByIdAndDelete(id);
    if (!msg) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Message deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/messages/[id] error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
