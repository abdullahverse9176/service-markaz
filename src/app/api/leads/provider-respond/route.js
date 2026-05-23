import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import Business from "@/models/Business";

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

// PATCH /api/leads/provider-respond
// Provider marks a lead they received as confirmed, rejected, or disputed.
// Body: { leadId, action: "confirmed" | "rejected" | "disputed" }
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

  const { leadId, action } = body;

  if (!leadId || !isValidObjectId(leadId)) {
    return NextResponse.json({ success: false, message: "Invalid lead ID" }, { status: 400 });
  }

  const validActions = ["confirmed", "rejected", "disputed"];
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { success: false, message: "Action must be confirmed, rejected, or disputed" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Verify the lead belongs to this provider's business
    const business = await Business.findOne({ owner: payload.id }).select("_id").lean();
    if (!business) {
      return NextResponse.json(
        { success: false, message: "No business found for this provider" },
        { status: 404 }
      );
    }

    const now = new Date();
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, business: business._id },
      {
        $set: {
          providerConfirmed: action === "confirmed" ? "yes" : "no",
          providerConfirmedAt: now,
          // Only update status if customer hasn't already confirmed/rejected,
          // so customer's confirmation takes final precedence.
          ...(action === "disputed" && { status: "disputed" }),
        },
        $push: {
          statusHistory: {
            status: action,
            actor: payload.id,
            actorRole: "provider",
            note: `Provider marked lead as ${action}`,
            timestamp: now,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found or does not belong to your business" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (err) {
    console.error("PATCH /api/leads/provider-respond error:", err);
    return NextResponse.json({ success: false, message: "Failed to update lead" }, { status: 500 });
  }
}
