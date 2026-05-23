import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import User from "@/models/User";

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

// GET /api/leads?businessId=xxx — returns current user's lead for that business
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId || !isValidObjectId(businessId)) {
    return NextResponse.json({ success: false, message: "Invalid business ID" }, { status: 400 });
  }

  await connectDB();

  const lead = await Lead.findOne({ customer: payload.id, business: businessId }).lean();

  return NextResponse.json({ success: true, data: lead ?? null });
}

// POST /api/leads — upsert: create on first contact, update source on repeat
// Status never downgrades — confirmed stays confirmed even if contacted again
export async function POST(request) {
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

  const { businessId, source } = body;

  if (!businessId || !isValidObjectId(businessId)) {
    return NextResponse.json({ success: false, message: "Invalid business ID" }, { status: 400 });
  }

  const validSources = ["call", "whatsapp", "form"];
  if (!validSources.includes(source)) {
    return NextResponse.json({ success: false, message: "Invalid source" }, { status: 400 });
  }

  await connectDB();

  // Verified email required to track contact leads
  const customer = await User.findById(payload.id).select("isEmailVerified").lean();
  if (!customer?.isEmailVerified) {
    return NextResponse.json(
      { success: false, message: "Please verify your email to contact providers." },
      { status: 403 }
    );
  }

  // If the customer previously said "No Deal", reset so they can re-confirm
  // after contacting the business again.
  await Lead.updateOne(
    { customer: payload.id, business: businessId, customerConfirmed: "no" },
    {
      $unset: { customerConfirmed: "" },
      $set: { status: "pending", lastContactedAt: new Date() },
      $push: {
        statusHistory: {
          status: "pending",
          actor: payload.id,
          actorRole: "customer",
          note: `Re-contacted via ${source} after previous 'no deal' response`,
          timestamp: new Date(),
        },
      },
    }
  );

  // Upsert: update source on repeat contact; never touch status/confirmations
  // On first contact ($setOnInsert), record the initial statusHistory entry
  const lead = await Lead.findOneAndUpdate(
    { customer: payload.id, business: businessId },
    {
      $set: { source, lastContactedAt: new Date() },
      $setOnInsert: {
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            actor: payload.id,
            actorRole: "customer",
            note: `Initial contact via ${source}`,
            timestamp: new Date(),
          },
        ],
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, data: lead }, { status: 201 });
}
