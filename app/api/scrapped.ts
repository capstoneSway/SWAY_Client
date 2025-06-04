import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

export const unscrapPost = async (postId: number) => {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No JWT token found");

  const res = await api.delete(`/post/${postId}/scrap/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
