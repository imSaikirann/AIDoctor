import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  apiCreateMedicalRecord,
  apiDeleteMedicalRecord,
  apiGetDoctorPatients,
  apiGetMyMedicalRecords,
  apiGetPatientMedicalRecords,
  apiUpdateMedicalRecord,
} from "@/services/medicalRecords";
import type {
  CreateMedicalRecordPayload,
  DoctorPatient,
  MedicalRecord,
} from "@/types";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

type FormState = {
  title: string;
  recordType: string;
  content: string;
  eventAt: string;
};

const initialFormState: FormState = {
  title: "",
  recordType: "General",
  content: "",
  eventAt: "",
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const canCreate = role === "PATIENT" || role === "DOCTOR";

  const activePatientLabel = useMemo(() => {
    if (role !== "DOCTOR") return user?.email ?? "";
    return patients.find((patient) => patient.id === selectedPatientId)?.email ?? "";
  }, [patients, role, selectedPatientId, user?.email]);

  const loadPatientRecords = async (patientId: string) => {
    if (!patientId) {
      setRecords([]);
      return;
    }

    setRecords(await apiGetPatientMedicalRecords(patientId));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingRecordId(null);
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (role === "PATIENT") {
        setRecords(await apiGetMyMedicalRecords());
      } else if (role === "DOCTOR") {
        const doctorPatients = await apiGetDoctorPatients();
        setPatients(doctorPatients);

        const nextPatientId = selectedPatientId || doctorPatients[0]?.id || "";
        setSelectedPatientId(nextPatientId);
        await loadPatientRecords(nextPatientId);
      } else {
        setErrorMsg("Medical records are available only for patients and doctors.");
      }
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Failed to load medical records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const onDoctorPatientChange = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await loadPatientRecords(patientId);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Failed to load patient records."));
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onEdit = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setForm({
      title: record.title,
      recordType: record.recordType,
      content: record.content,
      eventAt: toDateTimeLocal(record.eventAt),
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const buildPayload = (): CreateMedicalRecordPayload => ({
    title: form.title.trim(),
    recordType: form.recordType.trim(),
    content: form.content.trim(),
    eventAt: form.eventAt ? new Date(form.eventAt).toISOString() : undefined,
    patientId: role === "DOCTOR" ? selectedPatientId : undefined,
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = buildPayload();

      if (editingRecordId) {
        await apiUpdateMedicalRecord(editingRecordId, payload);
        setSuccessMsg("Medical record updated successfully.");
      } else {
        await apiCreateMedicalRecord(payload);
        setSuccessMsg("Medical record saved securely.");
      }

      resetForm();
      await load();
    } catch (error) {
      setErrorMsg(
        getApiErrorMessage(
          error,
          editingRecordId
            ? "Failed to update medical record."
            : "Failed to save medical record."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (recordId: string) => {
    if (!window.confirm("Delete this medical record? This cannot be undone.")) {
      return;
    }

    setDeletingId(recordId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await apiDeleteMedicalRecord(recordId);
      if (editingRecordId === recordId) {
        resetForm();
      }
      setSuccessMsg(response.message || "Medical record deleted successfully.");
      await load();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Failed to delete medical record."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Medical Records</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Secure history, prescriptions, and visit notes with add, edit, and delete support.
        </p>
      </div>

      {role === "DOCTOR" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Select patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(event) => void onDoctorPatientChange(event.target.value)}
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">
              {editingRecordId ? "Edit Record" : "Add Record"}
            </h2>
            {editingRecordId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                required
                minLength={3}
                maxLength={120}
                placeholder="Annual health check summary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Record type
              </label>
              <Input
                value={form.recordType}
                onChange={(event) => updateForm("recordType", event.target.value)}
                required
                minLength={2}
                maxLength={40}
                placeholder="Lab, Prescription, Diagnosis"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Event date and time
            </label>
            <Input
              type="datetime-local"
              value={form.eventAt}
              onChange={(event) => updateForm("eventAt", event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Clinical notes / history details
            </label>
            <textarea
              value={form.content}
              onChange={(event) => updateForm("content", event.target.value)}
              required
              minLength={5}
              maxLength={10000}
              rows={5}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Enter diagnosis, medications, tests, symptoms, and follow-up notes."
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || (role === "DOCTOR" && !selectedPatientId)}
          >
            {submitting
              ? editingRecordId
                ? "Updating..."
                : "Saving..."
              : editingRecordId
                ? "Update Medical Record"
                : "Save Medical Record"}
          </Button>
        </form>
      )}

      {errorMsg ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {successMsg ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            History {activePatientLabel ? `- ${activePatientLabel}` : ""}
          </h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{record.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Event: {formatDate(record.eventAt)} | Added: {formatDate(record.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                    {record.recordType}
                  </span>
                  <Button type="button" variant="outline" onClick={() => onEdit(record)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deletingId === record.id}
                    onClick={() => void onDelete(record.id)}
                  >
                    {deletingId === record.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>

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
