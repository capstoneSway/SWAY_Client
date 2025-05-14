import AsyncStorage from "@react-native-async-storage/async-storage";

export const extractNicknameFromToken = async (): Promise<string | null> => {
  try {
    const tokenDataString = await AsyncStorage.getItem("kakaoTokenData");
    if (!tokenDataString) throw new Error("토큰이 없습니다.");

    const tokenData = JSON.parse(tokenDataString);

    if (!tokenData.idToken) {
      console.error("idToken이 없습니다.");
      return null;
    }

    const payloadBase64 = tokenData.idToken.split(".")[1];
    if (!payloadBase64) {
      console.error("JWT 형식이 잘못되었습니다.");
      return null;
    }

    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      )
    );

    console.log("디코딩된 페이로드:", decodedPayload);

    return decodedPayload.nickname || null;
  } catch (error) {
    console.error("토큰에서 사용자 이름 추출 실패:", error);
    return null;
  }
};

// 현재 시점에서 임시 로직입니다. 삭제되거나 대폭 수정될 예정입니다.
