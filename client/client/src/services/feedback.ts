import { api } from "@/lib/axios";
import type { Feedback } from "../types";

export async function apiCreateFeedback(payload: {
  appointmentId: string;
  rating: number;
  comment?: string;
}): Promise<Feedback> {
  const res = await api.post<Feedback>("/feedback", payload);
  return res.data;
}

export async function apiMyFeedbacks(): Promise<Feedback[]> {
  const res = await api.get<Feedback[]>("/feedback/my");
  return res.data;
}

export async function apiDoctorFeedbacks(): Promise<Feedback[]> {
  const res = await api.get<Feedback[]>("/feedback/doctor");
  return res.data;
}

export async function apiAdminFeedbacks(): Promise<Feedback[]> {
  const res = await api.get<Feedback[]>("/feedback/admin");
  return res.data;
}