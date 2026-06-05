import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "../lib/supabase/middleware";

/**
 * Protected route prefixes — unauthenticated users are redirected to /login.
 * These correspond to the (app) route group paths.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/categories",
  "/profile",
  "/settings",
];

/**
 * Auth route prefixes — authenticated users are redirected to /dashboard.
 * These correspond to the (auth) route group paths.
 */
const AUTH_ROUTES = ["/login", "/signup"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { supabase, response } = await createClient(request);

  // Refresh session on every request (Requirement 2.3 — session persistence)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users from protected routes to /login (Requirement 2.4)
  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to /dashboard
  if (user && isAuthRoute(pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser favicon)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
