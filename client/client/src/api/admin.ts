import { http } from "./http";
import type { DoctorPublic, User } from "../types";

export async function apiAdminUsers(): Promise<User[]> {
  const res = await http.get<User[]>("/api/admin/users");
  return res.data;
}

export async function apiAdminDoctors(): Promise<DoctorPublic[]> {
  const res = await http.get<DoctorPublic[]>("/api/admin/doctors");
  return res.data;
}

export async function apiVerifyDoctor(doctorId: string): Promise<void> {
  await http.patch(`/api/admin/verify/${doctorId}`);
}

export async function apiDailyBookings(): Promise<{ totalBookings: number }> {
  const res = await http.get<{ totalBookings: number }>("/api/admin/bookings");
  return res.data;
}