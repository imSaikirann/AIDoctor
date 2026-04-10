import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DoctorPublic, Feedback, User } from "../types";
import {
  apiAdminUsers,
  apiDailyBookings,
  apiDeleteDoctor,
  apiUpdateDoctor,
  apiVerifyDoctor,
} from "../services/admin";
import { apiAdminFeedbacks } from "../services/feedback";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";
import { Input } from "../components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

type UserWithDoctorProfile = User & {
  doctorProfile?: {
    id: string;
    userId?: string;
    email?: string;
    name?: string;
    specialization?: string;
    calLink?: string | null;
    verified: boolean;
    createdAt?: string;
  } | null;
};

type DoctorDraft = {
  email: string;
  name: string;
  specialization: string;
  calLink: string;
  verified: boolean;
};

export function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithDoctorProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DoctorDraft>>({});
  const [total, setTotal] = useState<number>(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg("");

    try {
      const [usersData, bookingsData, feedbackData] = await Promise.all([
        apiAdminUsers(),
        apiDailyBookings(),
        apiAdminFeedbacks(),
      ]);

      const typedUsers = usersData as UserWithDoctorProfile[];

      const doctorsData: DoctorPublic[] = typedUsers
        .filter((user) => user.doctorProfile)
        .map((user) => ({
          id: user.doctorProfile!.id,
          userId: user.doctorProfile!.userId ?? user.id,
          email: user.email,
          name: user.doctorProfile!.name ?? "",
          specialization: user.doctorProfile!.specialization ?? "",
          calLink: user.doctorProfile!.calLink ?? null,
          verified: user.doctorProfile!.verified,
          createdAt: user.doctorProfile!.createdAt ?? "",
        }));

      const nextDrafts = doctorsData.reduce<Record<string, DoctorDraft>>(
        (acc, doctor) => {
          acc[doctor.id] = {
            email: doctor.email ?? "",
            name: doctor.name,
            specialization: doctor.specialization,
            calLink: doctor.calLink ?? "",
            verified: doctor.verified,
          };
          return acc;
        },
        {}
      );

      setUsers(typedUsers);
      setDoctors(doctorsData);
      setDrafts(nextDrafts);
      setFeedbacks(feedbackData);
      setTotal(bookingsData.totalBookings);
    } catch (error) {
      console.log(error);
      setMsg(getApiErrorMessage(error, t("adminDashboard.failedLoad")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateDraft = (
    doctorId: string,
    key: keyof DoctorDraft,
    value: string | boolean
  ) => {
    setDrafts((current) => ({
      ...current,
      [doctorId]: {
        ...current[doctorId],
        [key]: value,
      },
    }));
  };

  const verify = async (doctorId: string) => {
    setMsg("");
    setVerifyingId(doctorId);

    try {
      await apiVerifyDoctor(doctorId);
      setMsg(t("adminDashboard.doctorVerified"));
      await load();
    } catch (error) {
      console.log(error);
      setMsg(getApiErrorMessage(error, t("adminDashboard.failedVerify")));
    } finally {
      setVerifyingId(null);
    }
  };

  const saveDoctor = async (doctorId: string) => {
    const draft = drafts[doctorId];

    if (!draft?.email.trim() || !draft.name.trim() || !draft.specialization.trim()) {
      setMsg(t("adminDashboard.fillDoctorFields"));
      return;
    }

    setMsg("");
    setSavingId(doctorId);

    try {
      await apiUpdateDoctor(doctorId, {
        email: draft.email.trim(),
        name: draft.name.trim(),
        specialization: draft.specialization.trim(),
        calLink: draft.calLink.trim() || null,
        verified: draft.verified,
      });
      setMsg(t("adminDashboard.doctorUpdated"));
      await load();
    } catch (error) {
      console.log(error);
      setMsg(getApiErrorMessage(error, t("adminDashboard.failedUpdate")));
    } finally {
      setSavingId(null);
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    const confirmed = window.confirm(t("adminDashboard.confirmDelete"));

    if (!confirmed) {
      return;
    }

    setMsg("");
    setDeletingId(doctorId);

    try {
      const response = await apiDeleteDoctor(doctorId);
      setMsg(response.message || t("adminDashboard.doctorDeleted"));
      await load();
    } catch (error) {
      console.log(error);
      setMsg(getApiErrorMessage(error, t("adminDashboard.failedDelete")));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-xl font-semibold">{t("adminDashboard.title")}</h2>
        <p className="text-sm text-zinc-600">
          {t("adminDashboard.totalBookings", { count: total })}
        </p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t("adminDashboard.doctors")}</h3>

        <div className="mt-3 space-y-4">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.loadingDoctors")}</div>
          ) : doctors.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.noDoctors")}</div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className="space-y-4 border-b pb-4 last:border-0">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      {t("common.email")}
                    </label>
                    <Input
                      value={drafts[doctor.id]?.email ?? ""}
                      onChange={(event) =>
                        updateDraft(doctor.id, "email", event.target.value)
                      }
                      placeholder={t("common.email")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      {t("auth.fullName")}
                    </label>
                    <Input
                      value={drafts[doctor.id]?.name ?? ""}
                      onChange={(event) =>
                        updateDraft(doctor.id, "name", event.target.value)
                      }
                      placeholder={t("adminDashboard.noName")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      {t("auth.specialization")}
                    </label>
                    <Input
                      value={drafts[doctor.id]?.specialization ?? ""}
                      onChange={(event) =>
                        updateDraft(doctor.id, "specialization", event.target.value)
                      }
                      placeholder={t("adminDashboard.noSpecialization")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      {t("auth.calLink")}
                    </label>
                    <Input
                      value={drafts[doctor.id]?.calLink ?? ""}
                      onChange={(event) =>
                        updateDraft(doctor.id, "calLink", event.target.value)
                      }
                      placeholder={t("auth.calLink")}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={drafts[doctor.id]?.verified ?? false}
                      onChange={(event) =>
                        updateDraft(doctor.id, "verified", event.target.checked)
                      }
                    />
                    {t("adminDashboard.verifiedToggle")}
                  </label>

                  {!doctor.verified ? (
                    <Button
                      variant="outline"
                      onClick={() => void verify(doctor.id)}
                      disabled={verifyingId === doctor.id}
                    >
                      {verifyingId === doctor.id
                        ? t("adminDashboard.verifying")
                        : t("adminDashboard.verify")}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      {t("adminDashboard.verifiedButton")}
                    </Button>
                  )}

                  <Button
                    onClick={() => void saveDoctor(doctor.id)}
                    disabled={savingId === doctor.id}
                  >
                    {savingId === doctor.id
                      ? t("adminDashboard.saving")
                      : t("adminDashboard.saveDoctor")}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => void deleteDoctor(doctor.id)}
                    disabled={deletingId === doctor.id}
                  >
                    {deletingId === doctor.id
                      ? t("adminDashboard.deleting")
                      : t("adminDashboard.deleteDoctor")}
                  </Button>

                  <div className="text-xs text-zinc-500">
                    {t("adminDashboard.verified", {
                      value: String(drafts[doctor.id]?.verified ?? doctor.verified),
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">{t("adminDashboard.allFeedback")}</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.loadingFeedback")}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.noFeedback")}</div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">
                  {t("adminDashboard.doctorRating", {
                    name: feedback.doctor?.name ?? "-",
                    rating: feedback.rating,
                  })}
                </div>
                <div className="text-sm text-zinc-700">
                  {t("adminDashboard.patient", { email: feedback.patient?.email ?? "-" })}
                </div>
                <div className="text-sm text-zinc-700">
                  {t("adminDashboard.appointment", { slot: feedback.appointment?.slot ?? "-" })}
                </div>
                <div className="text-sm text-zinc-600">
                  {feedback.comment || t("common.noComment")}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">{t("adminDashboard.allUsers")}</h3>

        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.loadingUsers")}</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.noUsers")}</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="border-b pb-2 text-sm last:border-0">
                <span className="font-medium">{user.email}</span>
                {user.role ? ` - ${t(`navbar.roles.${user.role}`)}` : ""}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
