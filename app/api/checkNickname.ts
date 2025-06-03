// 마이페이지 닉네임 변경시 닉네임 중복 확인용
import { api } from "./axios";

export const checkNickname = async (nickname: string): Promise<boolean> => {
  try {
    const response = await api.get("/accounts/check-nickname/", {
      params: { nickname },
    });
    return response.data.available;
  } catch (error) {
    console.error("닉네임 중복 검사 실패:", error);
    return false;
  }
};
