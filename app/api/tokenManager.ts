// src/api/tokenManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import refreshToken from "./refreshToken";

export default async function ensureValidToken(): Promise<string | null> {
  // 1) 저장된 Access/Refresh 토큰 꺼내기
  const access = await AsyncStorage.getItem("@jwt");
  const refresh = await AsyncStorage.getItem("@refreshToken");
  if (!access) return null;

  // 2) Access 만료 여부 확인
  const [, payload] = access.split(".");
  const exp = JSON.parse(
    Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (payload.length % 4)) % 4),
      "base64"
    ).toString()
  ).exp;
  const now = Math.floor(Date.now() / 1000);

  if (exp > now) {
    // 만료 전 → 그대로 사용
    return access;
  }

  // 3) Access 만료 & Refresh 가 있으면 갱신 시도
  if (refresh) {
    const data = await refreshToken(refresh);
    if (data?.access) {
      // 갱신된 토큰 저장
      const pairs: [string, string][] = [["@jwt", data.access]];
      if (data.refresh) pairs.push(["@refreshToken", data.refresh]);
      await AsyncStorage.multiSet(pairs);
      return data.access;
    }
  }

  // 4) 모두 실패 → 토큰 없음(null) 반환 (삭제는 UI에서 처리)
  return null;
}
