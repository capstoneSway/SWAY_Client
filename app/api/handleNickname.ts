import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// axios 인스턴스 불러오기

/**
 * 닉네임 중복 검사 (GET 요청 형식으로 nickname query 전달)
 * @param nickname 확인할 닉네임
 * @returns available 여부
 */
export async function checkNickname(nickname: string): Promise<boolean> {
  const token = await AsyncStorage.getItem("@jwt");
  const response = await axios.get(
    `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/accounts/check-nickname/?nickname=${encodeURIComponent(
      nickname
    )}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.available;
}

/**
 * 닉네임 설정
 * @param nickname 설정할 닉네임
 */
export async function setNickname(nickname: string): Promise<void> {
  const token = await AsyncStorage.getItem("@jwt");
  await axios.post(
    "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/accounts/set-nickname/",
    { nickname },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
