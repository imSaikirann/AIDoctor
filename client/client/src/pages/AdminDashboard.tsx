import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DoctorPublic, User, Feedback } from "../types";
import {
  apiAdminUsers,
  apiDailyBookings,
  apiVerifyDoctor,
} from "../services/admin";
import { apiAdminFeedbacks } from "../services/feedback";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";

type UserWithDoctorProfile = User & {
  doctorProfile?: {
    id: string;
    name?: string;
    specialization?: string;
    calLink?: string | null;
    verified: boolean;
    userId?: string;
    createdAt?: string;
  } | null;
};

export function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithDoctorProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

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
          name: user.doctorProfile!.name ?? "",
          specialization: user.doctorProfile!.specialization ?? "",
          calLink: user.doctorProfile!.calLink ?? null,
          verified: user.doctorProfile!.verified,
          createdAt: user.doctorProfile!.createdAt ?? "",
        }));

      setUsers(typedUsers);
      setDoctors(doctorsData);
      setFeedbacks(feedbackData);
      setTotal(bookingsData.totalBookings);
    } catch (error) {
      console.log(error);
      setMsg(t("adminDashboard.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const verify = async (doctorId: string) => {
    setMsg("");
    setVerifyingId(doctorId);

    try {
      await apiVerifyDoctor(doctorId);
      setMsg(t("adminDashboard.doctorVerified"));
      await load();
    } catch (error) {
      console.log(error);
      setMsg(t("adminDashboard.failedVerify"));
    } finally {
      setVerifyingId(null);
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

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.loadingDoctors")}</div>
          ) : doctors.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("adminDashboard.noDoctors")}</div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-start justify-between gap-4 border-b pb-3 last:border-0"
              >
                <div>
                  <div className="font-medium">{doctor.name || t("adminDashboard.noName")}</div>
                  <div className="text-sm text-zinc-700">
                    {doctor.specialization || t("adminDashboard.noSpecialization")}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {t("adminDashboard.verified", { value: String(doctor.verified) })}
                  </div>
                </div>

                {!doctor.verified ? (
                  <Button
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
