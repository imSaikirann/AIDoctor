import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api/auth";
import { getErrorMessage } from "../api/http";
// import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast";
import { useAuth } from "@/auth/useAuth";

export function Login() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("");
    try {
      await apiLogin(email, password);
      await refresh();
      nav("/");
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md px-4">
      <Card>
        <h2 className="text-lg font-semibold">Login</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={submit}>Login</Button>
          <Toast message={msg} />
        </div>
      </Card>
    </div>
  );
}