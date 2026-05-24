import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host");
  
  // Redirect Vercel domain to main domain
  if (hostname === "service-markaz.vercel.app") {
    const url = request.nextUrl.clone();
    url.host = "www.servicemarkaz.com";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
