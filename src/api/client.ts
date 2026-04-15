export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.replace(/\/$/, "");
  }
  throw new Error(
    "Missing VITE_API_BASE_URL. Copy .env.example to .env and set VITE_API_BASE_URL to your API root.",
  );
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Use on every authenticated request once screens call the real backend. */
export function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: options.method ?? "GET",
    headers: options.token
      ? authHeaders(options.token)
      : options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = await res.json().catch(() => ({}));

  if (res.status === 401) {
    throw new UnauthorizedError("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const raw =
      typeof payload?.message === "string" && payload.message
        ? payload.message
        : `Request failed with status ${res.status}`;
    const sanitized = raw.replace(/<[^>]*>/g, "").slice(0, 200);
    throw new Error(sanitized);
  }

  return payload as T;
}
