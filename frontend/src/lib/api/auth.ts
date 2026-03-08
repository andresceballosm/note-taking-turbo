export type AuthUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return {};
}

function toErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const obj = payload as Record<string, unknown>;

  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.detail === "string") return obj.detail;

  for (const value of Object.values(obj)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return fallback;
}

export async function signup(payload: SignupPayload) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not create account"));
  }

  return data;
}

export async function login(payload: LoginPayload) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Invalid credentials"));
  }

  return data as { message: string; user: AuthUser | null };
}

export async function getMe() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) return null;

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not fetch user"));
  }

  return data as AuthUser;
}

export async function signout() {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(toErrorMessage(data, "Could not sign out"));
  }

  return response.json() as Promise<{ message: string }>;
}
