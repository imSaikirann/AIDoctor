import { useEffect, useState } from "react";
import type { DoctorPublic, User, Feedback } from "../types";
import {
  apiAdminUsers,
  apiDailyBookings,
  apiVerifyDoctor,
} from "../services/admin";
import { apiAdminFeedbacks } from "../services/feedback";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";

type UserWithDoctorProfile = User & {
  doctorProfile?: {
    id: string;
    name?: string;
    specialization?: string;
    calLink?: string | null;
    verified: boolean;
    userId?: string;
    createdAt?: string;
  } | null;
};

export function AdminDashboard() {
  const [users, setUsers] = useState<UserWithDoctorProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg("");

    try {
      const [usersData, bookingsData, feedbackData] = await Promise.all([
        apiAdminUsers(),
        apiDailyBookings(),
        apiAdminFeedbacks(),
      ]);

      const typedUsers = usersData as UserWithDoctorProfile[];

      const doctorsData: DoctorPublic[] = typedUsers
        .filter((user) => user.doctorProfile)
        .map((user) => ({
          id: user.doctorProfile!.id,
          name: user.doctorProfile!.name ?? "",
          specialization: user.doctorProfile!.specialization ?? "",
          calLink: user.doctorProfile!.calLink ?? null,
          verified: user.doctorProfile!.verified,
          createdAt: user.doctorProfile!.createdAt ?? "",
        }));

      setUsers(typedUsers);
      setDoctors(doctorsData);
      setFeedbacks(feedbackData);
      setTotal(bookingsData.totalBookings);
    } catch (error) {
      console.log(error);
      setMsg("Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (doctorId: string) => {
    setMsg("");
    setVerifyingId(doctorId);

    try {
      await apiVerifyDoctor(doctorId);
      setMsg("Doctor verified successfully.");
      await load();
    } catch (error) {
      console.log(error);
      setMsg("Failed to verify doctor.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <p className="text-sm text-zinc-600">
          Total bookings: <b>{total}</b>
        </p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Doctors</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="text-sm text-zinc-600">No doctors found.</div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-start justify-between gap-4 border-b pb-3 last:border-0"
              >
                <div>
                  <div className="font-medium">{doctor.name || "No name"}</div>
                  <div className="text-sm text-zinc-700">
                    {doctor.specialization || "No specialization"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    verified: {String(doctor.verified)}
                  </div>
                </div>

                {!doctor.verified ? (
                  <Button
                    onClick={() => verify(doctor.id)}
                    disabled={verifyingId === doctor.id}
                  >
                    {verifyingId === doctor.id ? "Verifying..." : "Verify"}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Verified
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">All Feedback</h3>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-sm text-zinc-600">No feedback available.</div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">
                  {feedback.doctor?.name} — Rating {feedback.rating}/5
                </div>
                <div className="text-sm text-zinc-700">
                  Patient: {feedback.patient?.email}
                </div>
                <div className="text-sm text-zinc-700">
                  Appointment: {feedback.appointment?.slot}
                </div>
                <div className="text-sm text-zinc-600">
                  {feedback.comment || "No comment"}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">All Users</h3>

        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-zinc-600">No users found.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="border-b pb-2 text-sm last:border-0"
              >
                <span className="font-medium">{user.email}</span>
                {user.role ? ` — ${user.role}` : ""}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}