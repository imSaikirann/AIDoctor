import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DoctorPublic, Appointment } from "../types";
import {
  apiGetVerifiedDoctors,
  apiGetSlots,
  apiBookAppointment,
  apiMyAppointments,
} from "../services/appointment";

const AVATAR_COLORS = [
  "bg-[#9FE1CB] text-[#085041]",
  "bg-[#F5C4B3] text-[#712B13]",
  "bg-[#CECBF6] text-[#3C3489]",
  "bg-[#B5D4F4] text-[#0C447C]",
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

function toAbsoluteUrl(url: string): string {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-[#1D9E75] ${className}`}
      role="status"
    />
  );
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    CONFIRMED: "bg-[#E1F5EE] text-[#085041]",
    PENDING: "bg-[#FAEEDA] text-[#633806]",
    CANCELLED: "bg-[#FCEBEB] text-[#791F1F]",
  };
  const key = (status ?? "CONFIRMED").toUpperCase();

  return (
    <span
      className={`inline-block rounded-full px-2 py-px text-[10px] font-medium ${
        map[key] ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {t(`status.${key}`)}
    </span>
  );
}

function Toast({
  message,
  type = "info",
}: {
  message: string;
  type?: "success" | "error" | "info";
}) {
  if (!message) return null;
  const styles = {
    success: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    error: "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
    info: "bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]",
  };
  return (
    <div className={`mt-3 rounded-xl border px-4 py-2.5 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-zinc-400">
      {text}
    </div>
  );
}

function VideoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="9" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5L15 4V12L10 9.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 6h14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface DoctorCardProps {
  doctor: DoctorPublic;
  index: number;
  isExpanded: boolean;
  loadingSlots: boolean;
  slots: string[];
  booking: boolean;
  bookingSlot: string | null;
  onViewSlots: (id: string) => void;
  onBook: (doctorId: string, slot: string) => void;
}

function DoctorCard({
  doctor,
  index,
  isExpanded,
  loadingSlots,
  slots,
  booking,
  bookingSlot,
  onViewSlots,
  onBook,
}: DoctorCardProps) {
  const { t } = useTranslation();
  const avatarClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const calUrl = doctor.calLink ? toAbsoluteUrl(doctor.calLink) : null;

  return (
    <div
      className={`rounded-2xl border bg-white transition-all duration-200 ${
        isExpanded
          ? "border-[#1D9E75] shadow-sm"
          : "border-zinc-100 hover:border-zinc-200"
      }`}
    >
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl text-sm font-medium ${avatarClass}`}
          >
            {getInitials(doctor.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900">{doctor.name}</p>
            <span className="mt-0.5 inline-block rounded-full border border-zinc-100 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-500">
              {doctor.specialization}
            </span>
          </div>

          {calUrl && (
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={t("patientDashboard.openCal")}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:border-[#1D9E75] hover:text-[#1D9E75]"
            >
              <CalIcon />
              Cal.com
            </a>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-zinc-400">{t("patientDashboard.availableToday")}</span>
        </div>

        <button
          onClick={() => onViewSlots(doctor.id)}
          className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-150 ${
            isExpanded
              ? "bg-[#1D9E75] text-white"
              : "border border-zinc-200 bg-transparent text-zinc-700 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          }`}
        >
          {isExpanded ? t("patientDashboard.hideSlots") : t("patientDashboard.viewSlots")}
        </button>

        {isExpanded && (
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {t("patientDashboard.pickTime")}
            </p>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Spinner /> {t("patientDashboard.loadingSlots")}
              </div>
            ) : slots.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">{t("patientDashboard.noSlots")}</p>
                {calUrl && (
                  <a
                    href={calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-[#1D9E75] hover:text-[#1D9E75]"
                  >
                    <CalIcon />
                    {t("patientDashboard.bookViaCal")}
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isBookingThis = bookingSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={booking}
                      onClick={() => onBook(doctor.id, slot)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isBookingThis
                          ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                          : "border-zinc-200 text-zinc-700 hover:border-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
                      }`}
                    >
                      {isBookingThis ? (
                        <span className="flex items-center gap-1.5">
                          <Spinner className="border-white/40 border-t-white" />
                          {t("home.booking")}
                        </span>
                      ) : (
                        slot
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const { t } = useTranslation();
  const initials = appointment.doctor ? getInitials(appointment.doctor.name) : "??";
  const meetingUrl = appointment.meetingUrl ? toAbsoluteUrl(appointment.meetingUrl) : null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-white px-4 py-3 transition hover:border-zinc-200">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {appointment.doctor ? appointment.doctor.name : t("patientDashboard.doctorUnavailable")}
          </p>
          <p className="text-xs text-zinc-400">
            {appointment.doctor?.specialization ?? ""} · {appointment.slot}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={appointment.status} />

        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D9E75] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0F6E56]"
          >
            <VideoIcon />
            {t("patientDashboard.bookVideoCall")}
          </a>
        )}
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [slotCache, setSlotCache] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [doctorsData, appointmentsData] = await Promise.all([
        apiGetVerifiedDoctors(),
        apiMyAppointments(),
      ]);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch {
      showToast(t("patientDashboard.failedLoadDashboard"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleViewSlots = async (doctorId: string) => {
    if (expandedDoctorId === doctorId) {
      setExpandedDoctorId(null);
      return;
    }
    setExpandedDoctorId(doctorId);

    if (slotCache[doctorId]) return;

    setLoadingSlots(true);
    try {
      const res = await apiGetSlots(doctorId);
      setSlotCache((prev) => ({ ...prev, [doctorId]: res.availableSlots }));
    } catch {
      showToast(t("patientDashboard.failedLoadSlots"), "error");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (doctorId: string, slot: string) => {
    setBooking(true);
    setBookingSlot(slot);
    try {
      await apiBookAppointment({ doctorId, slot });
      showToast(t("patientDashboard.bookedSuccess"), "success");

      const [slotsRes, apptRes] = await Promise.all([
        apiGetSlots(doctorId),
        apiMyAppointments(),
      ]);
      setSlotCache((prev) => ({ ...prev, [doctorId]: slotsRes.availableSlots }));
      setAppointments(apptRes);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("patientDashboard.failedBook"), "error");
    } finally {
      setBooking(false);
      setBookingSlot(null);
    }
  };

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-background-tertiary, #f5f4f0)" }}
    >
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <h1
            className="text-3xl text-zinc-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 }}
          >
            {t("patientDashboard.greeting")} <em className="not-italic text-[#1D9E75]">{t("patientDashboard.role")}</em>
          </h1>
          <p className="mt-1 text-sm font-light text-zinc-500">
            {t("patientDashboard.subtitle")}
          </p>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              {t("patientDashboard.verifiedDoctors")}
            </p>
            {loading && <Spinner />}
          </div>

          {!loading && doctors.length === 0 ? (
            <EmptyState text={t("patientDashboard.noVerifiedDoctors")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {doctors.map((doctor, i) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  index={i}
                  isExpanded={expandedDoctorId === doctor.id}
                  loadingSlots={loadingSlots && expandedDoctorId === doctor.id}
                  slots={slotCache[doctor.id] ?? []}
                  booking={booking}
                  bookingSlot={bookingSlot}
                  onViewSlots={handleViewSlots}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              {t("patientDashboard.myAppointments")}
            </p>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">
              {appointments.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Spinner /> {t("patientDashboard.loadingAppointments")}
            </div>
          ) : appointments.length === 0 ? (
            <EmptyState text={t("patientDashboard.noBookings")} />
          ) : (
            <div className="space-y-2">
              {appointments.map((appt) => (
                <AppointmentRow key={appt.id} appointment={appt} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
