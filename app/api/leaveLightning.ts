import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

export async function leaveLightning(lightningId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) {
    throw new Error("JWT 토큰이 없습니다. 로그인 해주세요.");
  }

  const res = await api.post(
    `/lightning/${lightningId}/leave/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
