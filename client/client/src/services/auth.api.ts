import { api } from "@/lib/axios";
import type { User } from "../types";

export async function apiLogin(email: string, password: string): Promise<User> {
  const res = await api.post<User>("/auth/login", { email, password });
  return res.data;
}

export async function apiRegisterPatient(email: string, password: string): Promise<User> {
  const res = await api.post<User>("/auth/register/patient", { email, password });
  return res.data;
}

export async function apiRegisterDoctor(payload: {
  email: string;
  password: string;
  name: string;
  specialization: string;
  calLink?: string;
}): Promise<{ message: string; user: User }> {
  const res = await api.post<{ message: string; user: User }>("/auth/register/doctor", payload);
  return res.data;
}

export async function apiMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

export async function apiLogout(): Promise<void> {
  await api.post("/auth/logout");
}