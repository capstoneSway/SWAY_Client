// app/api/joinLightning.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

export async function joinLightning(lightningId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) {
    throw new Error("JWT 토큰이 없습니다. 로그인 해주세요.");
  }

  const res = await api.post(
    `/lightning/${lightningId}/join/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
