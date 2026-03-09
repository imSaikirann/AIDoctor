import { useEffect, useState } from "react";
import type { DoctorPublic, Appointment } from "../types";
import {
  apiGetVerifiedDoctors,
  apiGetSlots,
  apiBookAppointment,
  apiMyAppointments,
} from "../services/appointment";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";

export function PatientDashboard() {
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const load = async () => {
    setLoading(true);
    setMsg("");

    try {
      const [doctorsData, appointmentsData] = await Promise.all([
        apiGetVerifiedDoctors(),
        apiMyAppointments(),
      ]);

      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.log(error);
      setMsg("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleViewSlots = async (doctorId: string) => {
    setMsg("");
    setSelectedDoctorId(doctorId);
    setLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const res = await apiGetSlots(doctorId);
      setAvailableSlots(res.availableSlots);
    } catch (error) {
      console.log(error);
      setMsg("Failed to load available slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (doctorId: string, slot: string) => {
    setMsg("");
    setBooking(true);

    try {
      await apiBookAppointment({ doctorId, slot });
      setMsg("Appointment booked successfully.");

      const slotsRes = await apiGetSlots(doctorId);
      setAvailableSlots(slotsRes.availableSlots);

      const myAppointments = await apiMyAppointments();
      setAppointments(myAppointments);
    } catch (error) {
      console.log(error);
      setMsg("Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-xl font-semibold">Patient Dashboard</h2>
        <p className="text-sm text-zinc-600">
          Book appointments with verified doctors.
        </p>
        <Toast message={msg} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Verified Doctors</h3>

        {loading ? (
          <div className="text-sm text-zinc-600">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-sm text-zinc-600">No verified doctors found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">
                        {doctor.name}
                      </div>
                      <div className="text-sm text-zinc-700">
                        {doctor.specialization}
                      </div>
                    </div>

                    <Button onClick={() => handleViewSlots(doctor.id)}>
                      View Slots
                    </Button>
                  </div>

                  {selectedDoctorId === doctor.id ? (
                    <div className="border-t border-zinc-200 pt-3">
                      <div className="mb-2 text-sm font-medium">
                        Available Slots
                      </div>

                      {loadingSlots ? (
                        <div className="text-sm text-zinc-600">
                          Loading slots...
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-sm text-zinc-600">
                          No slots available.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant="outline"
                              disabled={booking}
                              onClick={() => handleBook(doctor.id, slot)}
                            >
                              {booking ? "Booking..." : slot}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">My Appointments</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-zinc-600">No bookings yet.</div>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <div className="text-sm">
                  <div className="font-medium">{appointment.slot}</div>

                  <div className="text-zinc-700">
                    {appointment.doctor
                      ? `${appointment.doctor.name} (${appointment.doctor.specialization})`
                      : "Doctor details not available"}
                  </div>

                  {appointment.meetingUrl ? (
                    <a
                      className="text-sm text-blue-600 underline"
                      href={appointment.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join meeting
                    </a>
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}