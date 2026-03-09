import axios from "axios";

export const getMedicalCodes = () =>
  axios.get("/medical-codes");

export const searchMedicalCodes = (q: string) =>
  axios.get(`/medical-codes/search?q=${q}`);