import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";
import { fetchUserInfo } from "../fetchUserInfo";
fetchUserInfo;

export default async function testPushNotification() {
  try {
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) throw new Error("JWT 없음");

    const userInfo = await fetchUserInfo(token);
    const userId = userInfo?.id;
    if (!userId) throw new Error("userId 없음");

    const res = await api.post(
      "/noti/test-push/",
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("푸시 테스트 성공", res.status);
  } catch (e: any) {
    console.error("푸시 테스트 실패:", e.response?.data || e.message);
  }
}
