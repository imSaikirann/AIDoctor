import { http } from "./http";
import type { Appointment, DoctorPublic } from "../types";

export async function apiListDoctors(): Promise<DoctorPublic[]> {
  const res = await http.get<DoctorPublic[]>("/api/appointments/doctors");
  return res.data;
}

/**
 * Called after Cal booking success event.
 * Backend should accept meetingUrl optional.
 */
export async function apiBookFromCal(payload: {
  doctorId: string;
  slot: string;
  meetingUrl?: string;
}): Promise<Appointment> {
  const res = await http.post<Appointment>("/api/appointments/book", payload);
  return res.data;
}

export async function apiMyAppointments(): Promise<Appointment[]> {
  const res = await http.get<Appointment[]>("/api/appointments/my");
  return res.data;
}

export async function apiDoctorAppointments(): Promise<Appointment[]> {
  const res = await http.get<Appointment[]>("/api/appointments/doctor");
  return res.data;
}