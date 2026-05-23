import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import Business from "@/models/Business";
import { sendEmail } from "@/lib/email/mailer";

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

// POST /api/admin/leads/followup
// Sends follow-up emails to customers for leads that are still pending/awaiting_response
// after the configured staleness threshold (default: 3 days).
// Body: { staleDays?: number }  — how many days old before a lead is considered stale
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  let body = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine — use defaults
  }

  const staleDays = Math.min(30, Math.max(1, parseInt(body.staleDays ?? "3", 10)));
  const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000);

  try {
    await connectDB();

    // Find leads that are stale and haven't exceeded the max follow-up limit (3 attempts)
    const staleLeads = await Lead.find({
      status: { $in: ["pending", "awaiting_response"] },
      createdAt: { $lt: cutoff },
      followupCount: { $lt: 3 },
      // Don't re-send if we already sent within the last 24 hours
      $or: [
        { followupSentAt: null },
        { followupSentAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    })
      .populate("customer", "name email")
      .populate("business", "name category city")
      .lean();

    if (!staleLeads.length) {
      return NextResponse.json({
        success: true,
        data: { sent: 0, message: "No stale leads found" },
      });
    }

    let sent = 0;
    const now = new Date();
    const errors = [];

    for (const lead of staleLeads) {
      const customer = lead.customer;
      const business = lead.business;

      if (!customer?.email || !business?.name) continue;

      try {
        await sendEmail({
          to: customer.email,
          subject: `Did your service go well? Let us know — Service Markaz`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
              <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">How did it go?</h1>
              </div>
              <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 16px 16px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${customer.name ?? "there"}</strong>,</p>
                <p style="color: #6b7280;">
                  You recently contacted <strong>${business.name}</strong> 
                  (${business.category} in ${business.city}) on Service Markaz.
                </p>
                <p style="color: #6b7280;">Did the service happen? Let the community know by confirming your deal and leaving a review!</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a 
                    href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://servicemarkaz.com"}/provider-profile"
                    style="display: inline-block; background: #3b82f6; color: white; font-weight: 600; padding: 12px 28px; border-radius: 10px; text-decoration: none;"
                  >
                    Confirm Your Deal
                  </a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                  This is an automated follow-up from Service Markaz. 
                  To stop receiving these, simply confirm or deny your deal.
                </p>
              </div>
            </div>
          `,
        });

        // Update follow-up tracking on the lead
        await Lead.findByIdAndUpdate(lead._id, {
          $set: { followupSentAt: now },
          $inc: { followupCount: 1 },
          $push: {
            statusHistory: {
              status: lead.status,
              actorRole: "system",
              note: `Follow-up email #${lead.followupCount + 1} sent`,
              timestamp: now,
            },
          },
        });

        sent++;
      } catch (emailErr) {
        errors.push({ leadId: lead._id, error: emailErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sent,
        total: staleLeads.length,
        errors: errors.length > 0 ? errors : undefined,
        staleDays,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/leads/followup error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
