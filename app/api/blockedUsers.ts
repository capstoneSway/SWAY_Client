import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/axios";

interface BlockedUser {
  id: number;
  blocked_user_id: number;
  nickname: string;
  profile_image: string;
  nationality: string;
  created_at: string;
}

export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const response = await api.get<BlockedUser[]>("/mypage/settings/block-user/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
