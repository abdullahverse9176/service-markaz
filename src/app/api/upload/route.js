import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// S3 client configured once at module level
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = formData.get("folder") || "service-markaz/businesses";

  if (!file || typeof file === "string") {
    return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
  }

  const fileExt = (file.name || "").split(".").pop().toLowerCase();
  const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"];
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(fileExt)) {
    return NextResponse.json(
      { success: false, message: "Only JPG, PNG and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, message: "File size must be under 5 MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // Process image: resize to max 1200px width, convert to WebP
    const processedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const key = `${folder}/${randomUUID()}.webp`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    // Serve via CloudFront CDN
    const cloudfrontBase = process.env.NEXT_PUBLIC_CLOUDFRONT_URL.replace(/\/$/, "");
    const url = `${cloudfrontBase}/${key}`;

    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ success: false, message: "Image upload failed" }, { status: 500 });
  }
}
