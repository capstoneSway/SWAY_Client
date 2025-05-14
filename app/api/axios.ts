import axios from "axios";

export const api = axios.create({
  baseURL: "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app", // <- 실제 백엔드 URL
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// 예시입니다. 백엔드 요청 주소로 설정하셔야 합니다...
