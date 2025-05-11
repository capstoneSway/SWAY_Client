import AsyncStorage from "@react-native-async-storage/async-storage";

export const validateToken = async () => {
  try {
    const tokenString = await AsyncStorage.getItem("kakaoAccessToken");

    if (!tokenString) {
      console.log("🚫 저장된 액세스 토큰이 없습니다.");
      return false;
    }

    const tokenData = JSON.parse(tokenString);
    const currentTime = Math.floor(Date.now() / 1000); // 초 단위 현재 시간

    if (tokenData.expiresAt <= currentTime) {
      console.log("❌ 토큰 만료");
      return false;
    }

    console.log("✅ 토큰 유효");
    return true;
  } catch (error) {
    console.error("🚫 토큰 검사 오류:", error);
    return false;
  }
};
