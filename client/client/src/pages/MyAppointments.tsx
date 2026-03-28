import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiMyAppointments } from "@/services/appointment";
import { apiCreateFeedback } from "@/services/feedback";
import type { Appointment } from "@/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

type FeedbackFormState = {
  rating: number;
  comment: string;
};

export default function MyAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<Record<string, FeedbackFormState>>({});

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      const res = await apiMyAppointments();
      setAppointments(res);
    } catch (err) {
      setError(t("appointmentsPage.failedLoad"));
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const handleFeedbackChange = (
    appointmentId: string,
    field: keyof FeedbackFormState,
    value: string | number
  ) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [appointmentId]: {
        rating: prev[appointmentId]?.rating ?? 0,
        comment: prev[appointmentId]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const handleSubmitFeedback = async (appointmentId: string) => {
    const current = feedbackForm[appointmentId];

    if (!current || !current.rating) {
      setMsg(t("appointmentsPage.ratingRequired"));
      return;
    }

    try {
      setSubmittingId(appointmentId);
      setMsg("");

      await apiCreateFeedback({
        appointmentId,
        rating: current.rating,
        comment: current.comment,
      });

      setMsg(t("appointmentsPage.feedbackSuccess"));
      await loadAppointments();
    } catch (err) {
      console.log(err);
      setMsg(t("appointmentsPage.feedbackFailed"));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-lg font-medium">{t("appointmentsPage.loading")}</div>;
  }

  if (error) {
    return <div className="p-10 font-medium text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-10">
      <h1 className="text-3xl font-bold">{t("appointmentsPage.title")}</h1>

      {msg ? <p className="text-sm text-blue-600">{msg}</p> : null}

      {appointments.length === 0 && (
        <p className="text-muted-foreground">{t("appointmentsPage.noAppointments")}</p>
      )}

      {appointments.map((appt) => (
        <Card key={appt.id}>
          <CardHeader>
            <CardTitle>
              {appt.doctor?.name} - {appt.doctor?.specialization}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="font-medium">{t("appointmentsPage.slot", { slot: appt.slot })}</p>

            {appt.meetingUrl ? (
              <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                <Button>{t("appointmentsPage.joinCall")}</Button>
              </a>
            ) : appt.doctor?.calLink ? (
              <a href={appt.doctor.calLink} target="_blank" rel="noopener noreferrer">
                <Button>{t("appointmentsPage.joinCall")}</Button>
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("appointmentsPage.meetingLater")}
              </p>
            )}

            <div className="border-t pt-4">
              {appt.feedback ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("appointmentsPage.yourFeedback")}</h3>
                  <p className="text-sm">
                    {t("appointmentsPage.rating", { rating: appt.feedback.rating })}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {appt.feedback.comment || t("common.noComment")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">{t("appointmentsPage.giveFeedback")}</h3>

                  <select
                    className="w-full rounded border p-2"
                    value={feedbackForm[appt.id]?.rating || ""}
                    onChange={(e) =>
                      handleFeedbackChange(appt.id, "rating", Number(e.target.value))
                    }
                  >
                    <option value="">{t("appointmentsPage.selectRating")}</option>
                    <option value="1">{t("appointmentsPage.ratingPoor")}</option>
                    <option value="2">{t("appointmentsPage.ratingFair")}</option>
                    <option value="3">{t("appointmentsPage.ratingGood")}</option>
                    <option value="4">{t("appointmentsPage.ratingVeryGood")}</option>
                    <option value="5">{t("appointmentsPage.ratingExcellent")}</option>
                  </select>

                  <textarea
                    className="w-full rounded border p-2"
                    placeholder={t("appointmentsPage.writeFeedback")}
                    value={feedbackForm[appt.id]?.comment || ""}
                    onChange={(e) =>
                      handleFeedbackChange(appt.id, "comment", e.target.value)
                    }
                  />

                  <Button
                    onClick={() => void handleSubmitFeedback(appt.id)}
                    disabled={submittingId === appt.id}
                  >
                    {submittingId === appt.id
                      ? t("appointmentsPage.submitting")
                      : t("appointmentsPage.submitFeedback")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
