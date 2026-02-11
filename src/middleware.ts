import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Students cannot access teacher routes
    if (pathname.startsWith("/profesor") && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/estudiante", req.url));
    }

    // Teachers cannot access student routes
    if (pathname.startsWith("/estudiante") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/profesor", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/estudiante/:path*", "/profesor/:path*"],
};
