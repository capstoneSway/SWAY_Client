import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function deleteNotification(id: number) {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.delete(`/noti/${id}/delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
