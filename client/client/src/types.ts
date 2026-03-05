export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type DoctorPublic = {
  id: string;
  name: string;
  specialization: string;
  calLink: string | null;
  verified: boolean;
  createdAt: string;
};

export type DoctorProfile = {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  calLink: string | null;
  verified: boolean;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  doctorProfile?: DoctorProfile | null;
};

export type Appointment = {
  id: string;
  slot: string;
  meetingUrl: string | null;
  createdAt: string;
  doctor?: { id: string; name: string; specialization: string };
  user?: { id: string; email: string };
};