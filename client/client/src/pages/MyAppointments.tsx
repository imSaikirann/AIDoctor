import { useEffect, useState } from "react";
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
      setError("Failed to load appointments");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
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
      setMsg("Please select a rating before submitting feedback.");
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

      setMsg("Feedback submitted successfully.");
      await loadAppointments();
    } catch (err) {
      console.log(err);
      setMsg("Failed to submit feedback.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-lg font-medium">Loading appointments...</div>;
  }

  if (error) {
    return <div className="p-10 font-medium text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-10">
      <h1 className="text-3xl font-bold">📅 My Appointments</h1>

      {msg ? <p className="text-sm text-blue-600">{msg}</p> : null}

      {appointments.length === 0 && (
        <p className="text-muted-foreground">No appointments yet</p>
      )}

      {appointments.map((appt) => (
        <Card key={appt.id}>
          <CardHeader>
            <CardTitle>
              {appt.doctor?.name} — {appt.doctor?.specialization}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="font-medium">Slot: {appt.slot}</p>

            {appt.meetingUrl ? (
              <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                <Button>🎥 Join Call</Button>
              </a>
            ) : appt.doctor?.calLink ? (
              <a href={appt.doctor.calLink} target="_blank" rel="noopener noreferrer">
                <Button>🎥 Join Call</Button>
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                Meeting link will appear before appointment
              </p>
            )}

            <div className="border-t pt-4">
              {appt.feedback ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">Your Feedback</h3>
                  <p className="text-sm">Rating: {appt.feedback.rating}/5</p>
                  <p className="text-sm text-zinc-600">
                    {appt.feedback.comment || "No comment"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">Give Feedback</h3>

                  <select
                    className="w-full rounded border p-2"
                    value={feedbackForm[appt.id]?.rating || ""}
                    onChange={(e) =>
                      handleFeedbackChange(appt.id, "rating", Number(e.target.value))
                    }
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>

                  <textarea
                    className="w-full rounded border p-2"
                    placeholder="Write feedback"
                    value={feedbackForm[appt.id]?.comment || ""}
                    onChange={(e) =>
                      handleFeedbackChange(appt.id, "comment", e.target.value)
                    }
                  />

                  <Button
                    onClick={() => handleSubmitFeedback(appt.id)}
                    disabled={submittingId === appt.id}
                  >
                    {submittingId === appt.id ? "Submitting..." : "Submit Feedback"}
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