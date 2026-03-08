import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/server/django-auth";

export async function POST(request: Request) {
  const redirectUrl = new URL("/auth/login", request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  return response;
}
