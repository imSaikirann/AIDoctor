import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import {

  apiBookAppointment,
  apiEmergencyBooking,
  apiGetSlots,
  apiGetVerifiedDoctors,
} from "@/services/appointment";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  calLink?: string | null;
}

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

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [confirmedDoctor, setConfirmedDoctor] = useState<Doctor | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState<Record<string, boolean>>({});
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await apiGetVerifiedDoctors();
        setDoctors(res as Doctor[]);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const toggleDoctor = async (doc: Doctor) => {
    if (expandedDoctor === doc.id) {
      setExpandedDoctor(null);
      return;
    }
    setExpandedDoctor(doc.id);
    setJoinLink(null);
    setConfirmedSlot(null);

    if (!slots[doc.id]) {
      try {
        setLoadingSlots((prev) => ({ ...prev, [doc.id]: true }));
        const res = await apiGetSlots(doc.id);
        setSlots((prev) => ({ ...prev, [doc.id]: res.availableSlots }));
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoadingSlots((prev) => ({ ...prev, [doc.id]: false }));
      }
    }
  };

  const handleEmergencyBooking = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    setBookingSlot("emergency");

    const res = await apiEmergencyBooking(); // new API

    setJoinLink(res.meetingUrl);
    setConfirmedDoctor(res.doctor);
    setConfirmedSlot(res.slot);

  } catch (err) {
    alert("Emergency booking failed");
    console.log(err)
  } finally {
    setBookingSlot(null);
  }
};
  const handleBook = async (slot: string) => {
    if (!expandedDoctor) return;
    const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
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
      setConfirmedDoctor(doctors.find((d) => d.id === expandedDoctor) ?? null);

      const updated = await apiGetSlots(expandedDoctor);
      setSlots((prev) => ({ ...prev, [expandedDoctor]: updated.availableSlots }));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("bookingFailed"));
    } finally {
      setBookingSlot(null);
    }
  };

  console.log(doctors)

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-background-tertiary, #f5f4f0)" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-6xl leading-tight text-green-500"
              style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
            >
              Find your{" "}
              <em className="not-italic" style={{ color: "#1D9E75" }}>
                doctor,
              </em>
              <br />
              book in seconds.
            </h1>
            <p className="mt-2 text-sm font-light text-gray-500">
              Verified specialists · Instant video consultation
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <button
  onClick={handleEmergencyBooking}
  className="w-full mb-6 bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-600 transition"
>
  🚨 Get Immediate Doctor
</button>
        {/* Section label */}
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
          Available doctors
        </p>

        {/* Doctors grid */}
        {loadingDoctors ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Spinner /> Loading doctors…
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-center py-16 text-sm text-gray-400">
            No doctors found.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doc, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isExpanded = expandedDoctor === doc.id;
              const docSlots = slots[doc.id] ?? [];
              const isLoadingSlots = loadingSlots[doc.id];

              return (
                <div
                  key={doc.id}
                  className={`rounded-2xl border bg-white transition-all duration-200 ${
                    isExpanded
                      ? "border-[#1D9E75] shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-5">
                    {/* Doctor info */}
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-xl text-base font-medium ${color.bg}`}
                        style={{ width: 52, height: 52, flexShrink: 0 }}
                      >
                        {getInitials(doc.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <span className="mt-0.5 inline-block rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500 border border-gray-100">
                          {doc.specialization}
                        </span>
                      </div>
                    </div>

                    {/* Availability pill */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-400">
                        Available slots today
                      </span>
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleDoctor(doc)}
                      className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all ${
                        isExpanded
                          ? "bg-[#1D9E75] text-white"
                          : "border border-gray-200 text-gray-700 hover:border-[#1D9E75] hover:text-[#1D9E75] bg-transparent"
                      }`}
                    >
                      {isExpanded ? "Hide slots" : "View available slots"}
                    </button>

                    {/* Slots */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                          Pick a time
                        </p>
                        {isLoadingSlots ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Spinner /> Loading slots…
                          </div>
                        ) : docSlots.length === 0 ? (
                          <p className="text-sm text-gray-400">{t("noSlots")}</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {docSlots.map((slot) => (
                              <button
                                key={slot}
                                disabled={!!bookingSlot}
                                onClick={() => handleBook(slot)}
                                className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                                  bookingSlot === slot
                                    ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                                    : "border-gray-200 text-gray-700 hover:border-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {bookingSlot === slot ? "Booking…" : slot}
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

        {/* Confirmation banner */}
        {joinLink && confirmedDoctor && confirmedSlot && (
          <div className="mt-6 rounded-2xl border-2 border-[#9FE1CB] bg-white p-6 animate-in slide-in-from-bottom-3 duration-300">
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
                Appointment confirmed
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              Your video consultation with{" "}
              <strong className="font-medium text-gray-700">
                {confirmedDoctor.name}
              </strong>{" "}
              is booked for{" "}
              <strong className="font-medium text-gray-700">{confirmedSlot}</strong>
              . A confirmation has been sent to your email.
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
                <rect x="1" y="3" width="9" height="10" rx="2" stroke="white" strokeWidth="1.5" />
                <path
                  d="M10 6.5L15 4V12L10 9.5V6.5Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {t("joinCall")}
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