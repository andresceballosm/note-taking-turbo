import { NextRequest, NextResponse } from "next/server";
import {
  buildDjangoUrl,
  extractErrorMessage,
  parseResponseBody,
} from "@/lib/server/django-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const djangoResponse = await fetch(buildDjangoUrl("/api/auth/register/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        password2: password,
        first_name: first_name ?? "",
        last_name: last_name ?? "",
      }),
    });

    const payload = await parseResponseBody(djangoResponse);

    if (!djangoResponse.ok) {
      return NextResponse.json(
        { message: extractErrorMessage(payload, "Could not create account") },
        { status: djangoResponse.status },
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal error while creating account" },
      { status: 500 },
    );
  }
}
