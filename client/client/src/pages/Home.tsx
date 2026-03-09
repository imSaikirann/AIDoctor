import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  apiBookAppointment,
  apiGetSlots,
  apiGetVerifiedDoctors,
} from "@/services/appointment";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  calLink?: string | null;
}

export default function Home() {
  const { t } = useTranslation();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await apiGetVerifiedDoctors();
        setDoctors(res as Doctor[]);
      } catch (error: unknown) {
        console.error("Failed to load doctors", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const loadSlots = async (doctorId: string) => {
    try {
      setSelectedDoctor(doctorId);
      setJoinLink(null);
      setSlots([]);
      setLoadingSlots(true);

      const res = await apiGetSlots(doctorId);
      setSlots(res.availableSlots);
    } catch (error: unknown) {
      console.error("Failed to load slots", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (slot: string) => {
    try {
      setLoading(true);

      const appointment = await apiBookAppointment({
        doctorId: selectedDoctor,
        slot,
      });

      setJoinLink(appointment.meetingUrl ?? null);

      alert(t("appointmentBooked"));

      const updatedSlots = await apiGetSlots(selectedDoctor);
      setSlots(updatedSlots.availableSlots);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(t("bookingFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🩺 {t("title")}</h1>
          <p className="text-muted-foreground">{t("chooseDoctor")}</p>
        </div>

        <LanguageSwitcher />
      </div>

      {loadingDoctors ? (
        <p className="text-sm text-muted-foreground">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No doctors found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {doctors.map((doc) => (
            <Card key={doc.id} className="h-fit">
              <CardHeader>
                <CardTitle>{doc.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {doc.specialization}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button className="w-full" onClick={() => loadSlots(doc.id)}>
                  {t("viewSlots")}
                </Button>

                {selectedDoctor === doc.id && (
                  <div className="flex flex-wrap gap-2">
                    {loadingSlots ? (
                      <p className="text-sm text-muted-foreground">
                        Loading slots...
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("noSlots")}
                      </p>
                    ) : (
                      slots.map((slot) => (
                        <Button
                          key={slot}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          onClick={() => handleBook(slot)}
                        >
                          {loading ? "Booking..." : slot}
                        </Button>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {joinLink && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle>✅ {t("appointmentConfirmed")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("joinInstruction")}
            </p>

            <a href={joinLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">🎥 {t("joinCall")}</Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}