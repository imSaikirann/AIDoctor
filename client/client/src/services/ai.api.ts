import { api } from "@/lib/axios";

export const sendChatMessage = (message: string) =>
  api.post("/api/ai/chat", { message });


export const getTriage = (message: string) =>
  api.post("/api/ai/triage", { message });