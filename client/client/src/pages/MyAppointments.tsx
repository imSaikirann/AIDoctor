import { useEffect, useState } from "react";
import { getMyAppointments } from "@/services/appointment.api";
import { loginUser } from "@/services/auth.api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  slot: string;
  doctor: {
    name: string;
    specialization: string;
    calLink?: string;
  };
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔐 demo login
  useEffect(() => {
    const init = async () => {
      const res = await loginUser("user@test.com");
      const tk = res.data.token;
      setToken(tk);

      const apptRes = await getMyAppointments(tk);
      setAppointments(apptRes.data);
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <div className="p-10">Loading appointments...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        📅 My Appointments
      </h1>

      {appointments.length === 0 && (
        <p className="text-muted-foreground">
          No appointments yet
        </p>
      )}

      {appointments.map((appt) => (
        <Card key={appt.id}>
          <CardHeader>
            <CardTitle>
              {appt.doctor.name} — {appt.doctor.specialization}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="font-medium">Slot: {appt.slot}</p>

            {appt.doctor.calLink && (
              <a
                href={appt.doctor.calLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>🎥 Join Call</Button>
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}