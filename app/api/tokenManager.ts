// src/api/tokenManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import refreshToken from "./refreshToken";

export default async function ensureValidToken(): Promise<string | null> {
  // 1) 저장된 Access/Refresh 토큰 꺼내기
  const access = await AsyncStorage.getItem("@jwt");
  const refresh = await AsyncStorage.getItem("@refreshToken");

  console.log("Stored tokens:");
  console.log("  - access:", access || "없음");
  console.log("  - refresh:", refresh || "없음");

  if (!access) {
    console.log("Access 토큰 없음 → null 반환");
    return null;
  }

  // 2) Access 만료 여부 확인
  try {
    const parts = access.split(".");
    if (parts.length !== 3) {
      console.warn("JWT 구조 이상 → null 반환");
      return null;
    }

    const payload = parts[1];
    const exp = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/") +
          "=".repeat((4 - (payload.length % 4)) % 4),
        "base64"
      ).toString()
    ).exp;

    const now = Math.floor(Date.now() / 1000);
    console.log("exp =", exp, "/ now =", now);

    if (exp > now) {
      console.log("Access 토큰 유효함 → 그대로 사용");
      return access;
    }

    console.log("Access 만료됨 → Refresh로 갱신 시도");

    // 3) Access 만료 & Refresh 가 있으면 갱신 시도
    if (refresh) {
      const data = await refreshToken(refresh);
      if (data?.access) {
        console.log("토큰 갱신 성공 → 저장 후 반환");
        const pairs: [string, string][] = [["@jwt", data.access]];
        if (data.refresh) {
          console.log("Refresh 토큰도 함께 갱신됨");
          pairs.push(["@refreshToken", data.refresh]);
        }
        await AsyncStorage.multiSet(pairs);
        return data.access;
      } else {
        console.log("토큰 갱신 실패 → null 반환");
      }
    } else {
      console.log("Refresh 토큰 없음 → null 반환");
    }
  } catch (e) {
    console.error("토큰 파싱 중 오류 발생:", e);
  }

  // 4) 모두 실패 → 토큰 없음(null) 반환
  return null;
}
