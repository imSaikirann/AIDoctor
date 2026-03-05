import { useEffect, useMemo, useState } from "react";
import type { DoctorPublic, Appointment } from "../types";
// import { apiBookFromCal, apiListDoctors, apiMyAppointments } from "../api/appointments";
import { getErrorMessage } from "../api/http";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";
import { CalModal } from "@/components/CallModal";
import { apiBookFromCal, apiListDoctors, apiMyAppointments } from "@/api/appointment";
// import { CalModal } from "../components/CalModal";

export function PatientDashboard() {
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPublic | null>(null);

  const selectedCalLink = useMemo(() => selectedDoctor?.calLink ?? "", [selectedDoctor]);

  const load = async () => {
    const [d, a] = await Promise.all([apiListDoctors(), apiMyAppointments()]);
    setDoctors(d);
    setAppointments(a);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [d, a] = await Promise.all([
        apiListDoctors(),
        apiMyAppointments(),
      ]);

      setDoctors(d);
      setAppointments(a);
    } catch {
      // optional error handling
    }
  };

  fetchData();
}, []);

  const openCal = (doc: DoctorPublic) => {
    setMsg("");
    if (!doc.calLink) {
      setMsg("This doctor has no Cal.com link configured");
      return;
    }
    setSelectedDoctor(doc);
    setCalOpen(true);
  };

  const onBooked = async (data: { startTime: string; endTime?: string; videoCallUrl?: string; uid?: string }) => {
    // This is fired by Cal embed: bookingSuccessfulV2 :contentReference[oaicite:4]{index=4}
    if (!selectedDoctor) return;

    try {
      // Save to your DB so Doctor/Admin dashboards show it
      await apiBookFromCal({
        doctorId: selectedDoctor.id,
        slot: data.startTime,
        meetingUrl: data.videoCallUrl
      });

      setMsg("Booking created and saved!");
      setCalOpen(false);
      await load();
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
      setCalOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Patient Dashboard</h2>
        <p className="text-sm text-zinc-600">Book verified doctors using Cal.com embed.</p>
        <Toast message={msg} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {doctors.map((d) => (
          <Card key={d.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{d.name}</div>
                <div className="text-sm text-zinc-700">{d.specialization}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {d.calLink ? "Cal link connected" : "No Cal link"}
                </div>
              </div>
              <Button onClick={() => openCal(d)} disabled={!d.calLink}>
                Book
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold">My Appointments</h3>
        <div className="mt-3 space-y-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <div className="text-sm">
                <div className="font-medium">{a.slot}</div>
                <div className="text-zinc-700">
                  {a.doctor ? `${a.doctor.name} (${a.doctor.specialization})` : ""}
                </div>
                {a.meetingUrl ? (
                  <a className="text-sm text-blue-600 underline" href={a.meetingUrl} target="_blank" rel="noreferrer">
                    Join meeting
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
          {appointments.length === 0 ? <div className="text-sm text-zinc-600">No bookings yet.</div> : null}
        </div>
      </div>

      <CalModal
        open={calOpen}
        onClose={() => setCalOpen(false)}
        calLink={selectedCalLink}
        onBooked={onBooked}
      />
    </div>
  );
}