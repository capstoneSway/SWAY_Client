import axios from "axios";

export const api = axios.create({
  baseURL: "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app",
  withCredentials: true, // ✅ 쿠키를 반드시 포함하도록
});
