import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client configured once at module level
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a pre-signed URL for viewing a private S3 document.
 * URL expires after specified time (default: 1 hour).
 * 
 * @param {string} key - S3 object key (e.g., "service-markaz/verifications/uuid.webp")
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
export async function generatePresignedUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_PRIVATE_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Failed to generate document URL");
  }
}

/**
 * Generate pre-signed URLs for multiple documents.
 * 
 * @param {string[]} keys - Array of S3 object keys
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string[]>} Array of pre-signed URLs
 */
export async function generatePresignedUrls(keys, expiresIn = 3600) {
  try {
    const urls = await Promise.all(
      keys.map((key) => generatePresignedUrl(key, expiresIn))
    );
    return urls;
  } catch (error) {
    console.error("Error generating pre-signed URLs:", error);
    throw new Error("Failed to generate document URLs");
  }
}
