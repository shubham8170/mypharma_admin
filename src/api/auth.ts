import { apiUrl } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

const DEMO_EMAIL = "admin@mypharma.com";
const DEMO_PASSWORD = "admin123";

function hasCustomApiBase(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (hasCustomApiBase()) {
    const res = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await res.json().catch(() => ({}))) as LoginResponse & { message?: string };
    if (!res.ok) {
      throw new Error(typeof body.message === "string" ? body.message : "Login failed");
    }
    if (!body.token || !body.user) {
      throw new Error("Invalid response from server");
    }
    return { token: body.token, user: body.user };
  }

  await new Promise((r) => setTimeout(r, 400));

  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error(`Use demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  return {
    token: "demo-jwt-token",
    user: {
      id: "usr_001",
      name: "Admin User",
      email: DEMO_EMAIL,
      role: "SUPER_ADMIN",
    },
  };
}

export { DEMO_EMAIL, DEMO_PASSWORD };
