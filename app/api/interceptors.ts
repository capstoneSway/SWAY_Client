import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosInstance, InternalAxiosRequestConfig, AxiosHeaders } from "axios";

export function applyInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await AsyncStorage.getItem("@jwt");
        if (token) {
          if (config.headers && typeof config.headers.set === "function") {
            config.headers.set("Authorization", `Bearer ${token}`);
          } else {
            config.headers = AxiosHeaders.from({
              ...(config.headers || {}),
              Authorization: `Bearer ${token}`,
            });
          }
        } else {
          console.warn("⚠️ JWT 토큰 없음 (accessToken)");
        }
        return config;
      } catch (error) {
        console.error("🔴 Token 설정 중 오류 발생:", error);
        return config;
      }
    },
    (error) => Promise.reject(error)
  );
}