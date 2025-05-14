import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app", // <- 실제 백엔드 URL
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// 예시입니다. 백엔드 요청 주소로 설정하셔야 합니다...

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // ① 저장소에서 jwt_access 토큰 꺼내기
    const token = await AsyncStorage.getItem("jwt_access");
    if (token) {
      // ② 헤더에 자동으로 Bearer 토큰 붙이기
      if (!config.headers) {
        config.headers = {} as AxiosHeaders;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
