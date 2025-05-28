import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

export async function deleteLightning(id: number) {
  try {
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) {
      throw new Error("JWT 토큰이 없습니다. 로그인 해주세요.");
    }
    console.log(
      `[deleteLightning] deleting lightning id=${id} with token=${token?.slice(
        0,
        10
      )}...`
    );

    const res = await api.delete(`/lightning/${id}/delete/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[deleteLightning] 삭제 성공:", res.data);
    return res.data;
  } catch (error) {
    console.error("[deleteLightning] 삭제 실패:", error);
    throw error;
  }
}
