import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/notes"];
const publicRoutes = ["/auth/login", "/auth/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    const isLoggedIn = Boolean(accessToken || refreshToken);

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isPublicRoute && isLoggedIn) {
      return NextResponse.redirect(new URL("/notes", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
