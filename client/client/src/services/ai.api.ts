import { api } from "@/lib/axios";

export const sendChatMessage = (message: string) =>
  api.post("/ai/chat", { message });


export const getTriage = (message: string) =>
  api.post("/ai/triage", { message });