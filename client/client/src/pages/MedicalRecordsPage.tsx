import { FormEvent, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useAuth } from "@/auth/useAuth";
import type { DoctorPatient, MedicalRecord } from "@/types";
import {
  apiCreateMedicalRecord,
  apiGetDoctorPatients,
  apiGetMyMedicalRecords,
  apiGetPatientMedicalRecords,
} from "@/services/medicalRecords";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("General");
  const [content, setContent] = useState("");
  const [eventAt, setEventAt] = useState("");

  const canCreate = role === "PATIENT" || role === "DOCTOR";

  const activePatientLabel = useMemo(() => {
    if (role !== "DOCTOR") return user?.email ?? "";
    return patients.find((p) => p.id === selectedPatientId)?.email ?? "";
  }, [patients, role, selectedPatientId, user?.email]);

  const loadPatientRecords = async (patientId: string) => {
    if (!patientId) {
      setRecords([]);
      return;
    }
    const list = await apiGetPatientMedicalRecords(patientId);
    setRecords(list);
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (role === "PATIENT") {
        const list = await apiGetMyMedicalRecords();
        setRecords(list);
      } else if (role === "DOCTOR") {
        const doctorPatients = await apiGetDoctorPatients();
        setPatients(doctorPatients);

        const initialPatientId = selectedPatientId || doctorPatients[0]?.id || "";
        setSelectedPatientId(initialPatientId);
        await loadPatientRecords(initialPatientId);
      } else {
        setErrorMsg("Medical records are available only for patients and doctors.");
      }
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "Failed to load medical records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const onDoctorPatientChange = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setLoading(true);
    setErrorMsg("");
    try {
      await loadPatientRecords(patientId);
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "Failed to load patient records."));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        title: title.trim(),
        recordType: recordType.trim(),
        content: content.trim(),
        eventAt: eventAt ? new Date(eventAt).toISOString() : undefined,
        patientId: role === "DOCTOR" ? selectedPatientId : undefined,
      };

      await apiCreateMedicalRecord(payload);
      setSuccessMsg("Medical record saved securely.");
      setTitle("");
      setRecordType("General");
      setContent("");
      setEventAt("");
      await load();
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "Failed to save medical record."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Medical Records</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Encrypted long-term patient history storage for secure continuity of care.
        </p>
      </div>

      {role === "DOCTOR" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Select patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => onDoctorPatientChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {patients.length === 0 ? (
              <option value="">No linked patients found</option>
            ) : (
              patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.email}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {canCreate && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Add Record</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={120}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Annual health check summary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Record type
              </label>
              <input
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                required
                minLength={2}
                maxLength={40}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Lab, Prescription, Diagnosis"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Event date and time
            </label>
            <input
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Clinical notes / history details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={5}
              maxLength={10000}
              rows={5}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Enter diagnosis, medications, tests, symptoms, and follow-up notes."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || (role === "DOCTOR" && !selectedPatientId)}
            className="rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F6E56] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Save Medical Record"}
          </button>
        </form>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            History {activePatientLabel ? `- ${activePatientLabel}` : ""}
          </h2>
          {loading && <span className="text-sm text-zinc-500">Loading...</span>}
        </div>

        {!loading && records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
            No medical records found yet.
          </div>
        ) : (
          records.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-900">
                  {record.title}
                </h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                  {record.recordType}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Event: {formatDate(record.eventAt)} | Added: {formatDate(record.createdAt)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
                {record.content}
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                Created by: {record.createdBy.email} ({record.createdBy.role})
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
