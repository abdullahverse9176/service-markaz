import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import SiteSettings from "@/models/SiteSettings";

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

// GET /api/admin/settings
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  let settings = await SiteSettings.findOne().lean();
  if (!settings) {
    settings = await new SiteSettings({}).save();
    settings = settings.toObject();
  }

  return NextResponse.json({ success: true, data: settings });
}

// PUT /api/admin/settings
export async function PUT(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  // Whitelist allowed top-level fields
  const ALLOWED = [
    "siteName",
    "siteUrl",
    "contactEmail",
    "phone",
    "whatsapp",
    "socialLinks",
    "requireApproval",
    "emailOnSubmission",
    "autoBlockNegative",
    "notifyOnRegistration",
    "notifyOnListing",
    "notifyOnReview",
    "notifyOnFlaggedReview",
  ];

  const update = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  await connectDB();
  const settings = await SiteSettings.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json({ success: true, data: settings });
}
