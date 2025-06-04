import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function getUnreadCount(): Promise<number> {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.get("/noti/unread-count/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.unread_count || 0;
}
