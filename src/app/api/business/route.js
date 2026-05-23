import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
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

// POST /api/business — Create a new business listing
export async function POST(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name, email, phone, whatsapp,
    title, category, city, area, about,
    services, experience, completedProjects, specializations, serviceAreas,
    pricing, availability, responseTime, socialLinks,
    profileImage, bannerImage,
    lat, lng,
  } = body;

  // Field validation
  const requiredFields = { name, phone, title, category, city, area };
  const missing = Object.keys(requiredFields).filter((key) => !requiredFields[key]);
  if (missing.length) {
    return NextResponse.json(
      { success: false, message: `Required fields missing: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
  }

  if (!services?.length || services.every((s) => !s)) {
    return NextResponse.json({ success: false, message: "At least one service is required" }, { status: 400 });
  }

  await connectDB();

  // Run both prerequisite checks in parallel to save 1 DB round trip
  const [requestingUser, existing] = await Promise.all([
    User.findById(payload.id).select("isEmailVerified").lean(),
    Business.findOne({ owner: payload.id }).select("_id").lean(),
  ]);

  if (!requestingUser?.isEmailVerified) {
    return NextResponse.json(
      { success: false, message: "Please verify your email before creating a business listing." },
      { status: 403 }
    );
  }

  if (existing) {
    return NextResponse.json(
      { success: false, message: "You already have a registered business listing" },
      { status: 409 }
    );
  }

  const business = await Business.create({
    owner: payload.id,
    name: name.trim(),
    email: email?.toLowerCase().trim() || "",
    phone: phone.trim(),
    whatsapp: whatsapp?.trim() || "",
    title: title.trim(),
    category,
    city,
    area: area.trim(),
    about: about?.trim() || "",
    services: services.filter(Boolean).map((s) => s.trim()),
    experience: Number(experience) || 0,
    completedProjects: Number(completedProjects) || 0,
    specializations: specializations?.filter(Boolean).map((s) => s.trim()) || [],
    serviceAreas: serviceAreas?.filter(Boolean).map((s) => s.trim()) || [],
    pricing: {
      calloutFee: pricing?.calloutFee || "",
      hourlyRate: pricing?.hourlyRate || "",
      minCharge: pricing?.minCharge || "",
    },
    availability,
    responseTime,
    socialLinks: {
      facebook:  socialLinks?.facebook?.trim()  || "",
      instagram: socialLinks?.instagram?.trim() || "",
      youtube:   socialLinks?.youtube?.trim()   || "",
      website:   socialLinks?.website?.trim()   || "",
      linkedin:  socialLinks?.linkedin?.trim()  || "",
      tiktok:    socialLinks?.tiktok?.trim()    || "",
    },
    profileImage: profileImage || "",
    bannerImage: bannerImage || "",
    ...(lat != null && lng != null
      ? { location: { type: "Point", coordinates: [Number(lng), Number(lat)] } }
      : {}),
  });

  // Update user role to provider
  await User.findByIdAndUpdate(payload.id, { role: "provider" });

  return NextResponse.json({ success: true, data: business }, { status: 201 });
}

// GET /api/business — Get the logged-in user's business listing
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const business = await Business.findOne({ owner: payload.id });
  if (!business) {
    return NextResponse.json({ success: false, message: "No business listing found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: business });
}

// PUT /api/business — Update the logged-in user's business listing
export async function PUT(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name, email, phone, whatsapp,
    title, category, city, area, about,
    services, experience, completedProjects, specializations, serviceAreas,
    pricing, availability, responseTime, socialLinks,
    profileImage, bannerImage,
    lat, lng,
  } = body;

  const requiredFields = { name, phone, title, category, city, area };
  const missing = Object.keys(requiredFields).filter((key) => !requiredFields[key]);
  if (missing.length) {
    return NextResponse.json(
      { success: false, message: `Required fields missing: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
  }

  if (!services?.length || services.every((s) => !s)) {
    return NextResponse.json({ success: false, message: "At least one service is required" }, { status: 400 });
  }

  await connectDB();

  const business = await Business.findOne({ owner: payload.id });
  if (!business) {
    return NextResponse.json({ success: false, message: "No business listing found" }, { status: 404 });
  }

  business.name = name.trim();
  business.email = email?.toLowerCase().trim() || "";
  business.phone = phone.trim();
  business.whatsapp = whatsapp?.trim() || "";
  business.title = title.trim();
  business.category = category;
  business.city = city;
  business.area = area.trim();
  business.about = about?.trim() || "";
  business.services = services.filter(Boolean).map((s) => s.trim());
  business.experience = Number(experience) || 0;
  business.completedProjects = Number(completedProjects) || 0;
  business.specializations = specializations?.filter(Boolean).map((s) => s.trim()) || [];
  business.serviceAreas = serviceAreas?.filter(Boolean).map((s) => s.trim()) || [];
  business.pricing = {
    calloutFee: pricing?.calloutFee || "",
    hourlyRate: pricing?.hourlyRate || "",
    minCharge: pricing?.minCharge || "",
  };
  business.availability = availability;
  business.responseTime = responseTime;
  business.socialLinks = {
    facebook:  socialLinks?.facebook?.trim()  || "",
    instagram: socialLinks?.instagram?.trim() || "",
    youtube:   socialLinks?.youtube?.trim()   || "",
    website:   socialLinks?.website?.trim()   || "",
    linkedin:  socialLinks?.linkedin?.trim()  || "",
    tiktok:    socialLinks?.tiktok?.trim()    || "",
  };
  if (profileImage) business.profileImage = profileImage;
  if (bannerImage !== undefined) business.bannerImage = bannerImage;
  if (lat != null && lng != null) {
    business.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
  }

  await business.save();

  return NextResponse.json({ success: true, data: business });
}

// PATCH /api/business — Toggle availability status only
export async function PATCH(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { availability } = body;
  if (!["Available", "Unavailable"].includes(availability)) {
    return NextResponse.json({ success: false, message: "Invalid availability value" }, { status: 400 });
  }

  await connectDB();

  const business = await Business.findOneAndUpdate(
    { owner: payload.id },
    { availability },
    { new: true, select: "availability" }
  );

  if (!business) {
    return NextResponse.json({ success: false, message: "No business listing found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { availability: business.availability } });
}
