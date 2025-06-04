import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function readAllNotifications() {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.post("/noti/read-all/", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
