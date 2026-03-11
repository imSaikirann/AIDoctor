import { api } from "@/lib/axios";
import type { User } from "../types";

export type DoctorPublic = {
  id: string;
  name?: string;
  specialization?: string;
  verified: boolean;
  userId?: string;
};

export async function apiVerifyDoctor(id: string): Promise<DoctorPublic> {
  const res = await api.patch<DoctorPublic>(`/admin/verify/${id}`);
  return res.data;
}

export async function apiAdminUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/admin/users");
  return res.data;
}

export async function apiDailyBookings(): Promise<{ totalBookings: number }> {
  const res = await api.get<{ totalBookings: number }>("/admin/bookings");
  return res.data;
}