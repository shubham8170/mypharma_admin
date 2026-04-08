const DEFAULT_BASE = "/api/v1";

export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("http")) {
    return `${base}${p}`;
  }
  return `${base}${p}`;
}

/** Use on every authenticated request once screens call the real backend. */
export function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
