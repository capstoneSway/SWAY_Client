import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function fetchAllNotifications() {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.get("/noti/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
