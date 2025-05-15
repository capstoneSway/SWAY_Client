import { api } from "./axios";

export default async function fetchUserInfo(jwtAccessToken: string) {
  try {
<<<<<<< HEAD
    const response = await api.get("/accounts/user/info/", {
=======
    const response = await api.get("user/info/", {
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
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
