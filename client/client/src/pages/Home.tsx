import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  apiBookAppointment,
  apiEmergencyBooking,
  apiGetSlots,
  apiGetVerifiedDoctors,
} from "@/services/appointment";
import type { DoctorPublic } from "@/types";

const AVATAR_COLORS = [
  { bg: "bg-teal-100 text-teal-800", ring: "ring-teal-200" },
  { bg: "bg-orange-100 text-orange-800", ring: "ring-orange-200" },
  { bg: "bg-violet-100 text-violet-800", ring: "ring-violet-200" },
  { bg: "bg-blue-100 text-blue-800", ring: "ring-blue-200" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatSlotLabel(slot: string, language: string, emergencyLabel: string): string {
  if (!slot.startsWith("Emergency ")) {
    return slot;
  }

  const isoPart = slot.slice("Emergency ".length);
  const date = new Date(isoPart);
  if (Number.isNaN(date.getTime())) {
    return slot;
  }

  return emergencyLabel.replace("{{date}}", date.toLocaleString(language));
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, refresh } = useAuth();

  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [confirmedDoctor, setConfirmedDoctor] = useState<DoctorPublic | null>(null);

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState<Record<string, boolean>>({});
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyPassword, setEmergencyPassword] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await apiGetVerifiedDoctors();
        setDoctors(res);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    void fetchDoctors();
  }, []);

  const toggleDoctor = async (doctor: DoctorPublic) => {
    if (expandedDoctor === doctor.id) {
      setExpandedDoctor(null);
      return;
    }

    setExpandedDoctor(doctor.id);
    setJoinLink(null);
    setConfirmedSlot(null);

    if (slots[doctor.id]) {
      return;
    }

    try {
      setLoadingSlots((prev) => ({ ...prev, [doctor.id]: true }));
      const res = await apiGetSlots(doctor.id);
      setSlots((prev) => ({ ...prev, [doctor.id]: res.availableSlots }));
    } catch (err) {
      console.error("Failed to load slots", err);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, [doctor.id]: false }));
    }
  };

  const bookEmergency = async (payload?: { email?: string; password?: string }) => {
    try {
      setBookingSlot("emergency");

      const res = await apiEmergencyBooking(payload);
      await refresh();
      setJoinLink(res.meetingUrl ?? null);
      setConfirmedDoctor(res.doctor);
      setConfirmedSlot(res.slot);
      setShowEmergencyForm(false);
      setEmergencyEmail("");
      setEmergencyPassword("");
    } catch (err) {
      alert(getErrorMessage(err, t("home.emergencyBookingFailed")));
    } finally {
      setBookingSlot(null);
    }
  };

  const handleEmergencyBooking = () => {
    if (user) {
      void bookEmergency();
      return;
    }

    setShowEmergencyForm((prev) => !prev);
  };

  const handleEmergencySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emergencyEmail.trim() || !emergencyPassword.trim()) {
      alert(t("home.emergencyFormRequired"));
      return;
    }

    await bookEmergency({
      email: emergencyEmail.trim(),
      password: emergencyPassword,
    });
  };

  const handleBook = async (slot: string) => {
    if (!expandedDoctor) {
      return;
    }

    try {
      setBookingSlot(slot);

      const appointment = await apiBookAppointment({
        doctorId: expandedDoctor,
        slot,
      });

      setJoinLink(appointment.meetingUrl ?? null);
      setConfirmedSlot(slot);
      setConfirmedDoctor(
        doctors.find((doctor) => doctor.id === expandedDoctor) ?? null
      );

      const updated = await apiGetSlots(expandedDoctor);
      setSlots((prev) => ({
        ...prev,
        [expandedDoctor]: updated.availableSlots,
      }));
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }

      alert(getErrorMessage(err, t("home.bookingFailed")));
    } finally {
      setBookingSlot(null);
    }
  };

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-background-tertiary, #f5f4f0)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-6xl leading-tight text-green-500"
              style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
            >
              {t("home.heroTitlePrefix")}{" "}
              <em className="not-italic" style={{ color: "#1D9E75" }}>
                {t("home.heroTitleAccent")}
              </em>
              <br />
              {t("home.heroTitleSuffix")}
            </h1>
            <p className="mt-2 text-sm font-light text-gray-500">
              {t("home.heroSubtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <button
          onClick={handleEmergencyBooking}
          disabled={bookingSlot === "emergency"}
          className="mb-6 w-full rounded-2xl bg-red-500 py-4 text-lg font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {bookingSlot === "emergency"
            ? t("home.emergencyConnecting")
            : t("home.getImmediateDoctor")}
        </button>

        {showEmergencyForm && !user && (
          <form
            onSubmit={(event) => void handleEmergencySubmit(event)}
            className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <h2
                className="text-2xl text-gray-900"
                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
              >
                {t("home.emergencyFormTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("home.emergencyFormSubtitle")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                <span className="mb-1 block">{t("common.email")}</span>
                <input
                  type="email"
                  value={emergencyEmail}
                  onChange={(event) => setEmergencyEmail(event.target.value)}
                  placeholder={t("home.emergencyEmailPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1D9E75]"
                  autoComplete="email"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="mb-1 block">{t("common.password")}</span>
                <input
                  type="password"
                  value={emergencyPassword}
                  onChange={(event) => setEmergencyPassword(event.target.value)}
                  placeholder={t("home.emergencyPasswordPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1D9E75]"
                  autoComplete="new-password"
                />
              </label>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              {t("home.emergencyFormHelp")}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={bookingSlot === "emergency"}
                className="rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0F6E56] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {bookingSlot === "emergency"
                  ? t("home.emergencyConnecting")
                  : t("home.emergencySubmit")}
              </button>

              <button
                type="button"
                onClick={() => setShowEmergencyForm(false)}
                disabled={bookingSlot === "emergency"}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        )}

        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
          {t("home.availableDoctors")}
        </p>

        {loadingDoctors ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Spinner /> {t("home.loadingDoctors")}
          </div>
        ) : doctors.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">{t("home.noDoctors")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doctor, index) => {
              const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const isExpanded = expandedDoctor === doctor.id;
              const doctorSlots = slots[doctor.id] ?? [];
              const isLoadingSlots = loadingSlots[doctor.id];

              return (
                <div
                  key={doctor.id}
                  className={`rounded-2xl border bg-white transition-all duration-200 ${
                    isExpanded
                      ? "border-[#1D9E75] shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-xl text-base font-medium ${color.bg}`}
                        style={{ width: 52, height: 52, flexShrink: 0 }}
                      >
                        {getInitials(doctor.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <span className="mt-0.5 inline-block rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
                          {doctor.specialization}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-400">
                        {t("home.availableSlotsToday")}
                      </span>
                    </div>

                    <button
                      onClick={() => void toggleDoctor(doctor)}
                      className={`w-full rounded-xl bg-transparent py-2.5 text-sm font-medium transition-all ${
                        isExpanded
                          ? "bg-[#1D9E75] text-white"
                          : "border border-gray-200 text-gray-700 hover:border-[#1D9E75] hover:text-[#1D9E75]"
                      }`}
                    >
                      {isExpanded ? t("home.hideSlots") : t("home.viewSlots")}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                          {t("home.pickTime")}
                        </p>

                        {isLoadingSlots ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Spinner /> {t("home.loadingSlots")}
                          </div>
                        ) : doctorSlots.length === 0 ? (
                          <p className="text-sm text-gray-400">{t("home.noSlots")}</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {doctorSlots.map((slot) => (
                              <button
                                key={slot}
                                disabled={Boolean(bookingSlot)}
                                onClick={() => void handleBook(slot)}
                                className={`rounded-full border px-4 py-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                  bookingSlot === slot
                                    ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                                    : "border-gray-200 text-gray-700 hover:border-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
                                }`}
                              >
                                {bookingSlot === slot ? t("home.booking") : slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {joinLink && confirmedDoctor && confirmedSlot && (
          <div className="animate-in slide-in-from-bottom-3 mt-6 rounded-2xl border-2 border-[#9FE1CB] bg-white p-6 duration-300">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 9.5L7 13L14.5 5"
                    stroke="#1D9E75"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="text-lg text-gray-900"
                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
              >
                {t("home.appointmentConfirmed")}
              </h3>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              {t("home.appointmentBookedWith", {
                doctor: confirmedDoctor.name,
                slot: formatSlotLabel(
                  confirmedSlot,
                  i18n.resolvedLanguage ?? i18n.language,
                  t("home.emergencyConsultationAt", { date: "{{date}}" })
                ),
              })}
            </p>

            <a
              href={joinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-[#0F6E56]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="3"
                  width="9"
                  height="10"
                  rx="2"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6.5L15 4V12L10 9.5V6.5Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {t("home.joinCall")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#1D9E75]"
      role="status"
      aria-label="Loading"
    />
  );
}
