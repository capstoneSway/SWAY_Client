import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosHeaders, AxiosInstance } from "axios";

export function applyInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("@jwt");

        if (token) {
          const existingHeaders = config.headers ?? {};
          config.headers = AxiosHeaders.from({
            ...existingHeaders,
            Authorization: `Bearer ${token}`,
          });
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
