import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead     from "@/models/Lead";
import Business from "@/models/Business";
import Referral from "@/models/Referral";
import { applyReferralRewards } from "@/lib/utils/referralRewards";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

// Customer confirmation alone determines the final status.
// (No provider-side confirmation UI exists in v1.)
function resolveStatus(customerConfirmed) {
  if (customerConfirmed === "yes") return "confirmed";
  if (customerConfirmed === "no") return "rejected";
  return "awaiting_response";
}

// PATCH /api/leads/confirm — customer confirms or denies deal
export async function PATCH(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const { businessId, response } = body;

  if (!businessId || !isValidObjectId(businessId)) {
    return NextResponse.json({ success: false, message: "Invalid business ID" }, { status: 400 });
  }

  if (!["yes", "no"].includes(response)) {
    return NextResponse.json({ success: false, message: "Response must be 'yes' or 'no'" }, { status: 400 });
  }

  try {
    await connectDB();

    // Use findOneAndUpdate for atomicity — avoids save() validation edge-cases
    const newStatus = resolveStatus(response);
    const lead = await Lead.findOneAndUpdate(
      { customer: payload.id, business: businessId },
      {
        $set: {
          customerConfirmed: response,
          status: newStatus,
        },
        $push: {
          statusHistory: {
            status: newStatus,
            actor: payload.id,
            actorRole: "customer",
            note: `Customer ${response === "yes" ? "confirmed" : "denied"} the deal`,
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "No lead found. Contact this provider first." },
        { status: 404 }
      );
    }

    // ── Referral activation trigger ────────────────────────────────────────
    // When a lead is confirmed, the provider has received real work — activate
    // any pending referral for that business owner (fire-and-forget).
    if (lead.status === "confirmed") {
      try {
        const business = await Business.findById(lead.business).select("owner").lean();
        if (business?.owner) {
          const referral = await Referral.findOne({
            referee: business.owner,
            status:  "pending",
          });
          if (referral) {
            referral.status     = "approved";
            referral.approvedAt = new Date();
            await referral.save();
            await applyReferralRewards(referral.referrer);
          }
        }
      } catch (refErr) {
        // Non-critical — log but don't fail the lead confirmation
        console.error("Referral activation error:", refErr);
      }
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (err) {
    console.error("PATCH /api/leads/confirm error:", err);
    return NextResponse.json({ success: false, message: "Failed to update lead" }, { status: 500 });
  }
}
