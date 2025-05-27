import AsyncStorage from "@react-native-async-storage/async-storage";
import { InternalAxiosRequestConfig } from "axios";
import { api } from "./axios";

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("@jwt");

    if (token) {
      // headers가 AxiosHeaders 인스턴스라고 가정하고 set으로 설정
      config.headers?.set?.("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);
