import { revalidatePath } from "next/cache";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!path || !path.startsWith("/")) {
    return Response.json({ error: "Valid path parameter required" }, { status: 400 });
  }

  revalidatePath(path);

  return Response.json({
    revalidated: true,
    path,
    timestamp: new Date().toISOString(),
  });
}
