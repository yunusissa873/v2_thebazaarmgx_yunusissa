import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect dashboard routes
  if (pathname.startsWith("/vendor/dashboard")) {
    const kycStatus = request.cookies.get("kyc_status")?.value;
    const subscriptionStatus = request.cookies.get("subscription_status")?.value;
    
    if (kycStatus !== "verified") {
      return NextResponse.redirect(new URL("/vendor/verify", request.url));
    }
    
    if (subscriptionStatus !== "active") {
      return NextResponse.redirect(new URL("/vendor/subscription", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/vendor/dashboard/:path*"],
};
