import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  buildDjangoUrl,
  extractErrorMessage,
  parseResponseBody,
} from "@/lib/server/django-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const loginResponse = await fetch(buildDjangoUrl("/api/auth/login/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginPayload = await parseResponseBody(loginResponse);

    if (!loginResponse.ok) {
      return NextResponse.json(
        {
          message: extractErrorMessage(loginPayload, "Invalid credentials"),
        },
        { status: loginResponse.status },
      );
    }

    const access = (loginPayload as { access?: string }).access;
    const refresh = (loginPayload as { refresh?: string }).refresh;

    if (!access || !refresh) {
      return NextResponse.json(
        { message: "Invalid response from backend" },
        { status: 502 },
      );
    }

    const meResponse = await fetch(buildDjangoUrl("/api/auth/me/"), {
      method: "GET",
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });

    const mePayload = meResponse.ok
      ? await parseResponseBody(meResponse)
      : null;

    const response = NextResponse.json({
      message: "Login successful",
      user: mePayload,
    });

    response.cookies.set(ACCESS_COOKIE_NAME, access, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60,
    });
    response.cookies.set(REFRESH_COOKIE_NAME, refresh, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal error while signing in" },
      { status: 500 },
    );
  }
}
