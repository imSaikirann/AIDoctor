import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { apiRegisterDoctor } from "@/services/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";

export function RegisterDoctor() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [calLink, setCalLink] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!email || !password || !name || !specialization) {
      setMsg(t("auth.fillRequired"));
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      const res = await apiRegisterDoctor({
        email,
        password,
        name,
        specialization,
        calLink: calLink.trim() ? calLink.trim() : undefined,
      });

      setMsg(res.message);
      setEmail("");
      setPassword("");
      setName("");
      setSpecialization("");
      setCalLink("");
    } catch (err: unknown) {
      console.log(err);
      setMsg(getApiErrorMessage(err, t("common.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("auth.doctorRegistration")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.doctorVerifyNotice")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.fullName")}</Label>
            <Input
              id="name"
              placeholder="Dr. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="doctor@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("common.password")}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="specialization">{t("auth.specialization")}</Label>
            <Input
              id="specialization"
              placeholder="Cardiologist, Dermatologist..."
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calLink">{t("auth.calLink")}</Label>
            <Input
              id="calLink"
              placeholder="https://cal.com/yourname/30min"
              value={calLink}
              onChange={(e) => setCalLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("auth.calLinkHelp")}
            </p>
          </div>

          {msg && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {msg}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("auth.registeringDoctor") : t("auth.registerDoctor")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
