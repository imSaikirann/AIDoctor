import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8080", // change if needed
  withCredentials: true
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string") return msg;
    }
    return err.message;
  }
  return "Something went wrong";
}