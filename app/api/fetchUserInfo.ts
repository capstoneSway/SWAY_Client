// 새롭게 코드 수정_HY
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";
export async function fetchUserInfo(jwtAccessToken: string) {
  try {
    const response = await api.get("/accounts/user/info/", {
      headers: {
        Authorization: `Bearer ${jwtAccessToken}`,
      },
    });

    const userInfo = response.data;
    //console.log("🟢 사용자 정보:", userInfo);

    //  username 저장
    if (userInfo?.username) {
      await AsyncStorage.setItem("myUsername", userInfo.username);
      //console.log("✅ myUsername 저장됨:", userInfo.username);
    }

    return userInfo;
  } catch (error) {
    console.error("❌ 사용자 정보 로드 오류:", error);
    return null;
  }
}
