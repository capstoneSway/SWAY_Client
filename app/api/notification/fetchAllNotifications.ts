import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function fetchAllNotifications() {
  try {
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) {
      console.warn("[알림] JWT 토큰 없음");
      throw new Error("JWT 토큰 없음");
    }
    console.log("[알림] JWT 토큰:", token);

    const res = await api.get("/noti/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      "[알림] 전체 알림 데이터:\n" + JSON.stringify(res.data, null, 2)
    );
    return res.data;
  } catch (error) {
    console.error("[알림] 알림 목록 조회 실패:", error);
    throw error;
  }
}
