import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  buildDjangoUrl,
  extractErrorMessage,
  parseResponseBody,
} from "@/lib/server/django-auth";

type AuthorizedFetchOptions = {
  method: "GET" | "POST";
  body?: unknown;
  request: NextRequest;
};

async function executeWithRefresh({
  method,
  body,
  request,
}: AuthorizedFetchOptions) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!accessToken && !refreshToken) {
    return {
      response: null as Response | null,
      status: 401,
      payload: { message: "Not authenticated" },
      newAccessToken: null as string | null,
      shouldClearCookies: false,
    };
  }

  async function run(access: string) {
    return fetch(buildDjangoUrl("/api/notes/"), {
      method,
      headers: {
        Authorization: `Bearer ${access}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  }

  let currentAccess = accessToken;
  let notesResponse: Response | null = null;

  if (currentAccess) {
    notesResponse = await run(currentAccess);
  }

  if ((!notesResponse || notesResponse.status === 401) && refreshToken) {
    const refreshResponse = await fetch(
      buildDjangoUrl("/api/auth/token/refresh/"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      },
    );

    if (refreshResponse.ok) {
      const refreshPayload = (await parseResponseBody(refreshResponse)) as {
        access?: string;
      };
      currentAccess = refreshPayload.access ?? undefined;
      if (currentAccess) {
        notesResponse = await run(currentAccess);
      }
    }
  }

  const payload = notesResponse
    ? await parseResponseBody(notesResponse)
    : { message: "Not authenticated" };

  return {
    response: notesResponse,
    status: notesResponse?.status ?? 401,
    payload,
    newAccessToken:
      currentAccess && currentAccess !== accessToken ? currentAccess : null,
    shouldClearCookies: !notesResponse || notesResponse.status === 401,
  };
}

export async function GET(request: NextRequest) {
  const result = await executeWithRefresh({ method: "GET", request });

  if (!result.response || !result.response.ok) {
    const response = NextResponse.json(
      { message: "Could not fetch notes" },
      { status: result.status || 500 },
    );
    if (result.shouldClearCookies) {
      response.cookies.delete(ACCESS_COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
    }
    return response;
  }

  const response = NextResponse.json(result.payload);

  if (result.newAccessToken) {
    response.cookies.set(ACCESS_COOKIE_NAME, result.newAccessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60,
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await executeWithRefresh({ method: "POST", body, request });

    if (!result.response || !result.response.ok) {
      const response = NextResponse.json(
        {
          message: extractErrorMessage(
            result.payload,
            "Could not create note",
          ),
        },
        { status: result.status || 500 },
      );
      if (result.shouldClearCookies) {
        response.cookies.delete(ACCESS_COOKIE_NAME);
        response.cookies.delete(REFRESH_COOKIE_NAME);
      }
      return response;
    }

    const response = NextResponse.json(result.payload, { status: 201 });
    if (result.newAccessToken) {
      response.cookies.set(ACCESS_COOKIE_NAME, result.newAccessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}
