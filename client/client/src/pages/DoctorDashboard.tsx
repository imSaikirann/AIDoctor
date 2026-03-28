import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Appointment, Feedback } from "@/types";
import { apiDoctorAppointments } from "@/services/appointment";
import { apiDoctorFeedbacks } from "@/services/feedback";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export function DoctorDashboard() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setMsg("");

      const [appointmentData, feedbackData] = await Promise.all([
        apiDoctorAppointments(),
        apiDoctorFeedbacks(),
      ]);

      setAppointments(appointmentData);
      setFeedbacks(feedbackData);
    } catch (error) {
      console.log(error);
      setMsg(t("doctorDashboard.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-xl font-semibold">{t("doctorDashboard.title")}</h2>
        <p className="text-sm text-zinc-600">{t("doctorDashboard.subtitle")}</p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t("doctorDashboard.appointments")}</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("doctorDashboard.loadingAppointments")}</div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("doctorDashboard.noAppointments")}</div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">{appt.slot}</div>
                <div className="text-sm text-zinc-700">
                  {appt.user
                    ? t("doctorDashboard.patient", { email: appt.user.email })
                    : t("patientDashboard.patientDetailsUnavailable")}
                </div>
                {appt.meetingUrl ? (
                  <a
                    className="text-sm text-blue-600 underline"
                    href={appt.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("doctorDashboard.openVideoLink")}
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">{t("doctorDashboard.patientFeedback")}</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("doctorDashboard.loadingFeedback")}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("doctorDashboard.noFeedback")}</div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">
                  {t("doctorDashboard.rating", { rating: feedback.rating })}
                </div>
                <div className="text-sm text-zinc-700">
                  {t("doctorDashboard.patient", { email: feedback.patient?.email ?? "-" })}
                </div>
                <div className="text-sm text-zinc-700">
                  {t("doctorDashboard.appointment", { slot: feedback.appointment?.slot ?? "-" })}
                </div>
                <div className="text-sm text-zinc-600">
                  {feedback.comment || t("common.noComment")}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
