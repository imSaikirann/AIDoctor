import { api } from "@/lib/axios";
import type {
  ApiMessage,
  CreateMedicalRecordPayload,
  DoctorPatient,
  MedicalRecord,
  UpdateMedicalRecordPayload,
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

export async function apiUpdateMedicalRecord(
  id: string,
  payload: UpdateMedicalRecordPayload
): Promise<MedicalRecord> {
  const res = await api.put<MedicalRecord>(`/records/${id}`, payload);
  return res.data;
}

export async function apiDeleteMedicalRecord(id: string): Promise<ApiMessage> {
  const res = await api.delete<ApiMessage>(`/records/${id}`);
  return res.data;
}
