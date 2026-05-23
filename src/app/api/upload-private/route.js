import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB (stricter for verification documents)
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

/**
 * POST /api/upload-private
 * Upload verification documents to private S3 bucket.
 * Documents are converted to WebP and stored securely.
 */
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
  const folder = formData.get("folder") || "service-markaz/verifications";

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
    return NextResponse.json(
      { success: false, message: "File size must be under 2 MB" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // Process image: resize to max 800px width (smaller for documents), convert to WebP
    const processedBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const key = `${folder}/${randomUUID()}.webp`;

    // Upload to PRIVATE bucket (not publicly accessible)
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_PRIVATE_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: "image/webp",
        // No public cache headers — private documents
      })
    );

    // Return the S3 key (not a public URL)
    // Admin will use pre-signed URLs to view these documents
    return NextResponse.json({ success: true, data: { key } });
  } catch (error) {
    console.error("Private S3 upload error:", error);
    return NextResponse.json({ success: false, message: "Document upload failed" }, { status: 500 });
  }
}
