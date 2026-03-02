import { api } from "@/lib/axios";

export const getDoctors = () =>
  api.get("/appointments/doctors");

export const getSlots = (doctorId: string) =>
  api.get(`/appointments/slots/${doctorId}`);

export const bookAppointment = (
  data: { doctorId: string; slot: string },
  token: string
) =>
  api.post("/appointments/book", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getMyAppointments = (token: string) =>
  api.get("/appointments/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });