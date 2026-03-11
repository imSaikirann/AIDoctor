import { useEffect, useState } from "react";
import type { Appointment, Feedback } from "@/types";
import { apiDoctorAppointments } from "@/services/appointment";
import { apiDoctorFeedbacks } from "@/services/feedback";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export function DoctorDashboard() {
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
        <h2 className="text-xl font-semibold">Doctor Dashboard</h2>
        <p className="text-sm text-zinc-600">Your appointments and patient feedback are shown here.</p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Appointments</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-zinc-600">No appointments yet.</div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">{appt.slot}</div>
                <div className="text-sm text-zinc-700">
                  {appt.user ? `Patient: ${appt.user.email}` : "Patient details not available"}
                </div>
                {appt.meetingUrl ? (
                  <a
                    className="text-sm text-blue-600 underline"
                    href={appt.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open video link
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Patient Feedback</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-sm text-zinc-600">No feedback yet.</div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">Rating: {feedback.rating}/5</div>
                <div className="text-sm text-zinc-700">
                  Patient: {feedback.patient?.email}
                </div>
                <div className="text-sm text-zinc-700">
                  Appointment: {feedback.appointment?.slot}
                </div>
                <div className="text-sm text-zinc-600">
                  {feedback.comment || "No comment"}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}