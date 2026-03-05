import axios from "axios";

export const getMedicalCodes = () =>
  axios.get("/api/medical-codes");

export const searchMedicalCodes = (q: string) =>
  axios.get(`/api/medical-codes/search?q=${q}`);