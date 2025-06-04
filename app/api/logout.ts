import AsyncStorage from "@react-native-async-storage/async-storage";
//import CookieManager from "@react-native-cookies/cookies";
import { router } from "expo-router";
import { api } from "./axios";

const logout = async () => {
  try {
    const access = await AsyncStorage.getItem("@jwt");
    const refresh = await AsyncStorage.getItem("@refreshToken");

    if (!access || !refresh) {
      console.warn("로그아웃 시도 실패: 토큰이 존재하지 않음");
      throw new Error("No tokens available");
    }

    const res = await api.post(
      "/accounts/logout/kakao/",
      { refresh },
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    if (res.status === 204) {
      console.log("서버 로그아웃 성공 (204 No Content)");
    } else {
      console.warn(`서버 응답 상태 코드: ${res.status}`);
      console.warn("응답 내용:", res.data);
    }
  } catch (err: any) {
    if (err.response) {
      console.error("서버 응답 오류:", {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error("로그아웃 중 에러 발생:", err.message);
    }
  } finally {
    try {
      await AsyncStorage.clear();
      //await CookieManager.clearAll();
      console.log("로컬 토큰 + 쿠키 삭제 완료");
    } catch (cleanupErr) {
      console.error("로컬 삭제 중 에러:", cleanupErr);
    }

    router.replace("./auth");
  }
};

export default logout;
