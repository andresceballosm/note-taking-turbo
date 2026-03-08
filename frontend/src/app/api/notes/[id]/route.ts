import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  buildDjangoUrl,
  extractErrorMessage,
  parseResponseBody,
} from "@/lib/server/django-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function executeWithRefresh(
  request: NextRequest,
  id: string,
  method: "GET" | "PATCH" | "DELETE",
  body?: unknown,
) {
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
    return fetch(buildDjangoUrl(`/api/notes/${id}/`), {
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
  let response: Response | null = null;

  if (currentAccess) {
    response = await run(currentAccess);
  }

  if ((!response || response.status === 401) && refreshToken) {
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
        response = await run(currentAccess);
      }
    }
  }

  const payload = response
    ? await parseResponseBody(response)
    : { message: "Not authenticated" };

  return {
    response,
    status: response?.status ?? 401,
    payload,
    newAccessToken:
      currentAccess && currentAccess !== accessToken ? currentAccess : null,
    shouldClearCookies: !response || response.status === 401,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const result = await executeWithRefresh(request, id, "GET");

  if (!result.response || !result.response.ok) {
    const response = NextResponse.json(
      {
        message: extractErrorMessage(result.payload, "Could not fetch note"),
      },
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await executeWithRefresh(request, id, "PATCH", body);

    if (!result.response || !result.response.ok) {
      const response = NextResponse.json(
        {
          message: extractErrorMessage(
            result.payload,
            "The note could not be saved",
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

    const response = NextResponse.json(result.payload);
    if (result.newAccessToken) {
      response.cookies.set(ACCESS_COOKIE_NAME, result.newAccessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ message: "Payload invalid" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const result = await executeWithRefresh(request, id, "DELETE");

  if (!result.response || !result.response.ok) {
    const response = NextResponse.json(
      {
        message: extractErrorMessage(result.payload, "Could not delete note"),
      },
      { status: result.status || 500 },
    );
    if (result.shouldClearCookies) {
      response.cookies.delete(ACCESS_COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
    }
    return response;
  }

  const response = NextResponse.json({ success: true });
  if (result.newAccessToken) {
    response.cookies.set(ACCESS_COOKIE_NAME, result.newAccessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60,
    });
  }
  return response;
}
