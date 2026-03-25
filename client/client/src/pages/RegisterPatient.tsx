import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { useTranslation } from "react-i18next";

import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { apiRegisterPatient } from "@/services/auth.api";

export function RegisterPatient() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!email || !password) {
      setMsg(t("registerPatient.required"));
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      await apiRegisterPatient(email, password);
      await refresh();
      nav("/");
    } catch (err: unknown) {
      console.log(err);
      setMsg(t("registerPatient.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("registerPatient.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("registerPatient.subtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("registerPatient.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("registerPatient.emailPlaceholder")}
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("registerPatient.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {msg && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {msg}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("registerPatient.creating") : t("registerPatient.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
