import AsyncStorage from "@react-native-async-storage/async-storage";
import { InternalAxiosRequestConfig } from "axios";
import { api } from "./axios";

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("@jwt");

    if (token) {
      // headers가 undefined일 가능성 제거
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
