import { api } from "./axios";

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export default async function refreshToken(): Promise<RefreshResponse | null> {
  try {
    const response = await api.post<RefreshResponse>(
      "/accounts/token/refresh/",
      {}, // 빈 body
      {
        withCredentials: true, // 쿠키 포함 옵션
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("🟢 토큰 갱신 성공:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ 토큰 갱신 실패:", error);
    return null;
  }
}
