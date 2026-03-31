import { api } from "@/lib/axios";
import type {
  DoctorPublic,
  Appointment,
  EmergencyBookingResponse,
  EmergencyBookingPayload,
} from "../types";

export async function apiGetVerifiedDoctors(): Promise<DoctorPublic[]> {
  const res = await api.get<DoctorPublic[]>("/appointments/doctors");
  return res.data;
}

export async function apiGetSlots(
  doctorId: string
): Promise<{ doctorId: string; availableSlots: string[] }> {
  const res = await api.get<{ doctorId: string; availableSlots: string[] }>(
    `/appointments/slots/${doctorId}`
  );
  return res.data;
}


export async function apiEmergencyBooking(
  payload?: EmergencyBookingPayload
): Promise<EmergencyBookingResponse> {
  const res = await api.post<EmergencyBookingResponse>(
    "/appointments/emergency",
    payload ?? {}
  );
  return res.data;
}

export async function apiBookAppointment(payload: {
  doctorId: string;
  slot: string;
}): Promise<Appointment> {
  const res = await api.post<Appointment>("/appointments/book", payload);
  return res.data;
}

export async function apiMyAppointments(): Promise<Appointment[]> {
  const res = await api.get<Appointment[]>("/appointments/my");
  return res.data;
}


export async function apiDoctorAppointments(): Promise<Appointment[]> {
  const res = await api.get<Appointment[]>("/appointments/doctor");
  return res.data;
}
