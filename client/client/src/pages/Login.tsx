import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { apiLogin } from "@/services/auth.api";
import { useAuth } from "@/auth/useAuth";
import { useTranslation } from "react-i18next";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await apiLogin(email, password);
      await refresh();
      const redirectPath =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.log(error);
      setMsg(t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h2 className="mb-6 text-2xl font-semibold">{t("login.title")}</h2>

      {msg ? <p className="mb-4 text-sm text-red-500">{msg}</p> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder={t("login.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder={t("login.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white"
        >
          {loading ? t("login.loggingIn") : t("login.submit")}
        </button>
      </form>

      <div className="mt-4 text-sm">
        <Link to="/register/patient" className="text-blue-600 underline">
          {t("login.registerPatient")}
        </Link>
      </div>
    </div>
  );
}
