import { api } from "@/lib/axios";
import type {
  CreateMedicalRecordPayload,
  DoctorPatient,
  MedicalRecord,
} from "@/types";

export async function apiGetMyMedicalRecords(): Promise<MedicalRecord[]> {
  const res = await api.get<MedicalRecord[]>("/records/my");
  return res.data;
}

export async function apiGetDoctorPatients(): Promise<DoctorPatient[]> {
  const res = await api.get<DoctorPatient[]>("/records/doctor/patients");
  return res.data;
}

export async function apiGetPatientMedicalRecords(
  patientId: string
): Promise<MedicalRecord[]> {
  const res = await api.get<MedicalRecord[]>(`/records/patient/${patientId}`);
  return res.data;
}

export async function apiCreateMedicalRecord(
  payload: CreateMedicalRecordPayload
): Promise<MedicalRecord> {
  const res = await api.post<MedicalRecord>("/records", payload);
  return res.data;
}
