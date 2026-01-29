import axios from "axios";

const defaultHeader = {
  Accept: "application/json",
};

export const BACKEND_URL = "http://localhost:3000";

export const axiosWrapper = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL,
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});
