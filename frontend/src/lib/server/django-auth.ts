const DJANGO_API_BASE_URL =
  process.env.DJANGO_API_BASE_URL ?? process.env.BACKEND_API_URL ?? "http://localhost:8000";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export function buildDjangoUrl(pathname: string) {
  return `${DJANGO_API_BASE_URL}${pathname}`;
}

export async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { detail: text } : {};
}

export function extractErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const data = payload as Record<string, unknown>;

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return fallback;
}
