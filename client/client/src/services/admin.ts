import { api } from "@/lib/axios";
import type {
  ApiMessage,
  DoctorPublic,
  UpdateDoctorPayload,
  User,
} from "../types";

export async function apiVerifyDoctor(id: string): Promise<DoctorPublic> {
  const res = await api.patch<DoctorPublic>(`/admin/verify/${id}`);
  return res.data;
}

export async function apiUpdateDoctor(
  id: string,
  payload: UpdateDoctorPayload
): Promise<DoctorPublic> {
  const res = await api.patch<DoctorPublic>(`/admin/doctors/${id}`, payload);
  return res.data;
}

export async function apiDeleteDoctor(id: string): Promise<ApiMessage> {
  const res = await api.delete<ApiMessage>(`/admin/doctors/${id}`);
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
