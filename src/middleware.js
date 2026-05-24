import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host");
  
  // Redirect Vercel domain to main domain
  if (hostname && hostname.includes("service-markaz.vercel.app")) {
    const url = request.nextUrl.clone();
    url.hostname = "www.servicemarkaz.com";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
