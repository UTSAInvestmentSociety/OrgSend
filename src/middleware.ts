import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const {
      nextauth: { token },
      nextUrl,
    } = req;
    const isAuth = !!token;

    // Protected routes
    const isProtectedRoute =
      nextUrl.pathname.startsWith("/profile") ||
      nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/admin");

    // Admin routes
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");

    // Redirect unauthenticated users from protected routes
    if (!isAuth && isProtectedRoute) {
      return NextResponse.redirect(
        new URL(
          "/auth/signin?from=" + encodeURIComponent(nextUrl.pathname),
          req.url
        )
      );
    }

    // Redirect non-admin users from admin routes
    if (isAuth && isAdminRoute && token.userType !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect authenticated users from auth pages
    if (isAuth && nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware handle the logic
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
