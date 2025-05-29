import axios from "axios";
import { applyInterceptors } from "./interceptors";

export const api = axios.create({
  baseURL: "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

applyInterceptors(api); 