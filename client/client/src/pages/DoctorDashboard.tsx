import { useEffect, useState } from "react";
import type { Appointment } from "../types";
// import { apiDoctorAppointments } from "../api/appointments";
import { getErrorMessage } from "../api/http";
import { Card } from "../components/ui/card";
import { Toast } from "../components/ui/toast";
import { apiDoctorAppointments } from "@/api/appointment";

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const a = await apiDoctorAppointments();
        setAppointments(a);
      } catch (e: unknown) {
        setMsg(getErrorMessage(e));
      }
    })().catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Doctor Dashboard</h2>
        <p className="text-sm text-zinc-600">Your schedule will show after patients book via Cal.</p>
        <Toast message={msg} />
      </div>

      <div className="space-y-3">
        {appointments.map((a) => (
          <Card key={a.id}>
            <div className="text-sm">
              <div className="font-medium">{a.slot}</div>
              <div className="text-zinc-700">{a.user ? `Patient: ${a.user.email}` : ""}</div>
              {a.meetingUrl ? (
                <a className="text-sm text-blue-600 underline" href={a.meetingUrl} target="_blank" rel="noreferrer">
                  Open video link
                </a>
              ) : null}
            </div>
          </Card>
        ))}
        {appointments.length === 0 ? <div className="text-sm text-zinc-600">No appointments yet.</div> : null}
      </div>
    </div>
  );
}