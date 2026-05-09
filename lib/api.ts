// Tiny fetch wrapper used by client components.
// Throws on non-ok with a parsed message so call sites can `try/catch`.

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T = unknown>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
    ...init,
  });
  const body = await parse(res);
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "error" in body && (body as { error: string }).error) ||
      (typeof body === "string" && body) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg as string);
  }
  return body as T;
}
