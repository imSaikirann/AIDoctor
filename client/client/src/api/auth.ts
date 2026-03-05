import { http } from "./http";
import type { User } from "../types";

export async function apiLogin(email: string, password: string): Promise<User> {
  const res = await http.post<User>("/api/auth/login", { email, password });
  return res.data;
}

export async function apiRegisterPatient(email: string, password: string): Promise<User> {
  const res = await http.post<User>("/api/auth/register/patient", { email, password });
  return res.data;
}

export async function apiRegisterDoctor(payload: {
  email: string;
  password: string;
  name: string;
  specialization: string;
  calLink?: string;
}): Promise<{ message: string; user: User }> {
  const res = await http.post<{ message: string; user: User }>("/api/auth/register/doctor", payload);
  return res.data;
}

export async function apiMe(): Promise<User> {
  const res = await http.get<User>("/api/auth/me");
  return res.data;
}

export async function apiLogout(): Promise<void> {
  await http.post("/api/auth/logout");
}