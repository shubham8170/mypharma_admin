import { apiRequest } from "./client";

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

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function meRequest(token: string): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>("/auth/me", { token });
}

export async function refreshTokenRequest(token: string): Promise<{ token: string }> {
  return apiRequest<{ token: string }>("/auth/refresh", {
    method: "POST",
    token,
  });
}

export async function logoutRequest(token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}
