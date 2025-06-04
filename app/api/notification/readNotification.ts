import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function readNotification(id: number) {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.post(`/noti/${id}/read/`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
