import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes except /login, /signup, /api/auth, static assets and next internal requests
export const config = {
  matcher: [
    "/((?!login|signup|verify-email|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
