import { useEffect, useState } from "react";
import type { Appointment, Feedback } from "@/types";
import { apiDoctorAppointments } from "@/services/appointment";
import { apiDoctorFeedbacks } from "@/services/feedback";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

function toAbsoluteUrl(url: string): string {
  if (!url) return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

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
      setMsg("Failed to load doctor dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-xl font-semibold">{t("doctor.dashboardTitle")}</h2>
        <p className="text-sm text-zinc-600">{t("doctor.dashboardSubtitle")}</p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">{t("doctor.appointmentsTitle")}</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("doctor.loadingAppointments")}</div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("doctor.noAppointments")}</div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center gap-2 font-medium">
                  <span>{appt.slot}</span>
                  {appt.isEmergency && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      {t("doctor.emergencyBadge")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-zinc-700">
                  {appt.user
                    ? `${t("doctor.patientLabel")} ${appt.user.email}`
                    : t("doctor.patientNotAvailable")}
                </div>
                {appt.isEmergency && (
                  <div className="mt-1 text-sm text-zinc-700">
                    {appt.emergencyContactPhone && (
                      <div>{t("doctor.phoneLabel")} {appt.emergencyContactPhone}</div>
                    )}
                    {appt.emergencyProblem && (
                      <div>{t("doctor.problemLabel")} {appt.emergencyProblem}</div>
                    )}
                  </div>
                )}
                {appt.meetingUrl ? (
                  <a
                    className="text-sm text-blue-600 underline"
                    href={toAbsoluteUrl(appt.meetingUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("doctor.openMeeting")}
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">{t("doctor.feedbackTitle")}</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">{t("doctor.loadingFeedback")}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-sm text-zinc-600">{t("doctor.noFeedback")}</div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">{t("doctor.ratingLabel")} {feedback.rating}/5</div>
                <div className="text-sm text-zinc-700">
                  {t("doctor.patientLabel")} {feedback.patient?.email}
                </div>
                <div className="text-sm text-zinc-700">
                  {t("doctor.appointmentLabel")} {feedback.appointment?.slot}
                </div>
                <div className="text-sm text-zinc-600">
                  {feedback.comment || t("doctor.noComment")}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
