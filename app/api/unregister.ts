import AsyncStorage from "@react-native-async-storage/async-storage";
//import CookieManager from "@react-native-cookies/cookies";
import { router } from "expo-router";
import { api } from "./axios";

const deleteAccount = async () => {
  try {
    const access = await AsyncStorage.getItem("@jwt");

    if (!access) {
      console.warn("회원탈퇴 실패: access token 없음");
      throw new Error("No access token");
    }

    const res = await api.delete("/accounts/delete-account/", {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    if (res.status === 204 || res.status === 200) {
      console.log("회원탈퇴 성공");
    } else {
      console.warn(`탈퇴 응답 상태 코드: ${res.status}`);
      console.warn("응답 내용:", res.data);
    }
  } catch (err: any) {
    if (err.response) {
      console.error("탈퇴 요청 에러:", {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error("탈퇴 중 예외:", err.message);
    }
  } finally {
    await AsyncStorage.clear();
    //await CookieManager.clearAll();
    console.log("로컬 토큰/쿠키 제거");
    router.replace("./auth");
  }
};

export default deleteAccount;
