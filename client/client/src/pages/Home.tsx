import { useEffect, useState } from "react";
import {
  getDoctors,
  getSlots,
  bookAppointment,
} from "@/services/appointment.api";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  calLink?: string;
}

export default function Home() {
  const { t } = useTranslation();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [token, setToken] = useState<string>("");
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔐 login
  useEffect(() => {
    const login = async () => {
      try {
        const res = await login("user@test.com");
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
    const fetchDoctors = async () => {
      const res = await getDoctors();
      setDoctors(res.data);
    };

    fetchDoctors();
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
      alert(t("authNotReady"));
      return;
    }

    try {
      setLoading(true);

      const res = await bookAppointment(
        { doctorId: selectedDoctor, slot },
        token
      );

      setJoinLink(res.data.joinLink || null);

      alert(t("appointmentBooked"));

      loadSlots(selectedDoctor);
    } catch (err: any) {
      alert(err?.response?.data?.message || t("bookingFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        {t("authenticating")}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            🩺 {t("title")}
          </h1>

          <p className="text-muted-foreground">
            {t("chooseDoctor")}
          </p>
        </div>

        <LanguageSwitcher />

      </div>

      {/* Doctors */}
      <div className="grid gap-6 md:grid-cols-2">

        {doctors.map((doc) => (
          <Card key={doc.id} className="h-fit">

            <CardHeader>
              <CardTitle>
                {doc.name}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {doc.specialization}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">

              <Button
                className="w-full"
                onClick={() => loadSlots(doc.id)}
              >
                {t("viewSlots")}
              </Button>

              {selectedDoctor === doc.id && (
                <div className="flex flex-wrap gap-2">

                  {slots.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("noSlots")}
                    </p>
                  )}

                  {slots.map((slot) => (
                    <Button
                      key={slot}
                      variant="outline"
                      size="sm"
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

      </div>

      {/* Confirmation */}
      {joinLink && (
        <Card className="border-green-500 bg-green-50">

          <CardHeader>
            <CardTitle>
              ✅ {t("appointmentConfirmed")}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-muted-foreground">
              {t("joinInstruction")}
            </p>

            <a
              href={joinLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full">
                🎥 {t("joinCall")}
              </Button>
            </a>

          </CardContent>

        </Card>
      )}

    </div>
  );
}