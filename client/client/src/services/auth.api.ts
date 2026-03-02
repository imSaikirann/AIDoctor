import { api } from "@/lib/axios";

export const loginUser = (email: string) =>
  api.post("/auth/login", { email });