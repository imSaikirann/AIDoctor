import { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";
import { apiRegisterDoctor } from "../api/auth";
import { getErrorMessage } from "../api/http";

export function RegisterDoctor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [calLink, setCalLink] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("");
    try {
      const res = await apiRegisterDoctor({
        email,
        password,
        name,
        specialization,
        calLink: calLink.trim() ? calLink.trim() : undefined
      });
      setMsg(res.message);
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md px-4">
      <Card>
        <h2 className="text-lg font-semibold">Doctor Registration</h2>
        <p className="mt-1 text-sm text-zinc-600">
          After registration, admin must verify your account before you appear to patients.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Specialization</Label>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
          </div>
          <div>
            <Label>Cal.com Event Link</Label>
            <Input
              placeholder="https://cal.com/yourname/30min"
              value={calLink}
              onChange={(e) => setCalLink(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Use the event type link (not dashboard link).
            </p>
          </div>

          <Button onClick={submit}>Register Doctor</Button>
          <Toast message={msg} />
        </div>
      </Card>
    </div>
  );
}