import type { Note } from "@/components/note-card.component";

type NotesListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Note[];
};

type NoteWritePayload = {
  title: string;
  content: string;
  category: Note["category"];
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

export async function getNotes() {
  const response = await fetch("/api/notes", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) return [];

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not fetch notes"));
  }

  if (Array.isArray(data)) {
    return data as Note[];
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as NotesListResponse).results)
  ) {
    return (data as NotesListResponse).results;
  }

  return [];
}

export async function createNote(payload: NoteWritePayload) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "The note could not be saved"));
  }

  return data as Note;
}

export async function getNoteById(id: number | string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) return null;

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not fetch note"));
  }

  return data as Note;
}

export async function updateNote(
  id: number,
  payload: Partial<NoteWritePayload>,
) {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not save note"));
  }

  return data as Note;
}

export async function deleteNote(id: number | string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Not authenticated");
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(data, "Could not delete note"));
  }

  return { success: true };
}
