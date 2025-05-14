import { api } from "./axios";

export default async function fetchUserInfo(jwtAccessToken: string) {
  try {
    const response = await api.get("user/info/", {
      headers: {
        Authorization: `Bearer ${jwtAccessToken}`,
      },
    });
    console.log("🟢 사용자 정보:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 사용자 정보 로드 오류:", error);
    return null;
  }
}
