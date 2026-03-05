import { useEffect, useState } from "react";
import type { DoctorPublic, User } from "../types";
import { apiAdminDoctors, apiAdminUsers, apiDailyBookings, apiVerifyDoctor } from "../api/admin";
import { getErrorMessage } from "../api/http";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [u, d, b] = await Promise.all([apiAdminUsers(), apiAdminDoctors(), apiDailyBookings()]);
    setUsers(u);
    setDoctors(d);
    setTotal(b.totalBookings);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [u, d, b] = await Promise.all([
        apiAdminUsers(),
        apiAdminDoctors(),
        apiDailyBookings(),
      ]);

      setUsers(u);
      setDoctors(d);
      setTotal(b.totalBookings);
    } catch {
      // optional error handling
    }
  };

  fetchData();
}, []);

  const verify = async (doctorId: string) => {
    setMsg("");
    try {
      await apiVerifyDoctor(doctorId);
      setMsg("Doctor verified.");
      await load();
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <p className="text-sm text-zinc-600">Total bookings: <b>{total}</b></p>
        <Toast message={msg} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Doctors</h3>
        <div className="mt-3 space-y-3">
          {doctors.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-zinc-700">{d.specialization}</div>
                <div className="text-xs text-zinc-500">verified: {String(d.verified)}</div>
              </div>
              {!d.verified ? <Button onClick={() => verify(d.id)}>Verify</Button> : <Button variant="outline" disabled>Verified</Button>}
            </div>
          ))}
          {doctors.length === 0 ? <div className="text-sm text-zinc-600">No doctors found.</div> : null}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">All Users</h3>
        <div className="mt-3 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="text-sm border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
              <span className="font-medium">{u.email}</span> — {u.role}
            </div>
          ))}
          {users.length === 0 ? <div className="text-sm text-zinc-600">No users found.</div> : null}
        </div>
      </Card>
    </div>
  );
}