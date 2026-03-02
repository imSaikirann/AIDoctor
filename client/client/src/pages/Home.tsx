import { useEffect, useState } from "react";
import {
  getDoctors,
  getSlots,
  bookAppointment,
} from "@/services/appointment.api";
import { loginUser } from "@/services/auth.api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  calLink?: string;
}

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [token, setToken] = useState<string>("");
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔐 login via axios
  useEffect(() => {
    const login = async () => {
      try {
        const res = await loginUser("user@test.com");
        setToken(res.data.token);
      } catch (err) {
        console.error("Login failed", err);
      } finally {
        setAuthLoading(false);
      }
    };

    login();
  }, []);

  // 👨‍⚕️ load doctors
  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data));
  }, []);

  // 📅 load slots
  const loadSlots = async (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setJoinLink(null);
    const res = await getSlots(doctorId);
    setSlots(res.data);
  };

  // ✅ book appointment
  const handleBook = async (slot: string) => {
    if (!token) {
      alert("Auth not ready");
      return;
    }

    try {
      setLoading(true);

      const res = await bookAppointment(
        { doctorId: selectedDoctor, slot },
        token
      );

      

      setJoinLink(res.data.joinLink || null);
      alert("Appointment booked!");
      loadSlots(selectedDoctor);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-10 text-center">
        Loading authentication...
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        🩺 Book Doctor Appointment
      </h1>

      {/* Doctors */}
      {doctors.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle>
              {doc.name} — {doc.specialization}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button onClick={() => loadSlots(doc.id)}>
              View Slots
            </Button>

            {/* Slots */}
            {selectedDoctor === doc.id && (
              <div className="flex flex-wrap gap-2">
                {slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No slots available
                  </p>
                )}

                {slots.map((slot) => (
                  <Button
                    key={slot}
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleBook(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Join Call Card */}
      {joinLink && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>
              ✅ Appointment Confirmed
            </CardTitle>
          </CardHeader>

          <CardContent>
            <a
              href={joinLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full">
                🎥 Join Video Call
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}