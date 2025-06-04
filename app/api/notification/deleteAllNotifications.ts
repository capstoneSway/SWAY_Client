import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../axios";

export default async function deleteAllNotifications() {
  const token = await AsyncStorage.getItem("@jwt");
  const res = await api.delete("/noti/delete-all/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
