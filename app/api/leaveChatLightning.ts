import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL =
  "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app";

export async function leaveChatRoom(roomId: number) {
  try {
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) {
      throw new Error("JWT token not found");
    }

    const response = await axios.post(
      `${BASE_URL}/livechat/room/${roomId}/leave/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("채팅방 나가기 성공:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("채팅방 나가기 실패:", error.response?.data || error.message);
    throw error;
  }
}
