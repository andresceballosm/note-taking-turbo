import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  buildDjangoUrl,
  parseResponseBody,
} from "@/lib/server/django-auth";

async function fetchMe(accessToken: string) {
  const response = await fetch(buildDjangoUrl("/api/auth/me/"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  return response;
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let currentAccess = accessToken;
  let meResponse: Response | null = null;

  if (currentAccess) {
    meResponse = await fetchMe(currentAccess);
  }

  if ((!meResponse || meResponse.status === 401) && refreshToken) {
    const refreshResponse = await fetch(buildDjangoUrl("/api/auth/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      const refreshPayload = (await parseResponseBody(refreshResponse)) as {
        access?: string;
      };
      currentAccess = refreshPayload.access;

      if (currentAccess) {
        meResponse = await fetchMe(currentAccess);
      }
    }
  }

  if (!meResponse || !meResponse.ok) {
    const response = NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    response.cookies.delete(ACCESS_COOKIE_NAME);
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const userPayload = await parseResponseBody(meResponse);
  const response = NextResponse.json(userPayload);

  if (currentAccess && currentAccess !== accessToken) {
    response.cookies.set(ACCESS_COOKIE_NAME, currentAccess, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60,
    });
  }

  return response;
}
