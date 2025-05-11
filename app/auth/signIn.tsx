import { colors } from "@/constants/color";
import * as AuthSession from "expo-auth-session";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function AuthHome() {
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  const [isError, setIsError] = useState(false);
  const REST_API_KEY = "30ec7806d186838e36cbb3201fcc3fd5";
  const REDIRECT_URI = "http://localhost:8081/auth/signUsername";
  const SCOPES = [
    "account_email",
    "profile_image",
    "profile_nickname",
    "name",
    "gender",
  ];

  // AuthSession 설정
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: REST_API_KEY,
      redirectUri: REDIRECT_URI,
      scopes: SCOPES,
      responseType: "code",
      usePKCE: false,
    },
    {
      authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
    }
  );

  // 로그인 버튼 클릭 핸들러
  const handleKakaoLogin = async () => {
    console.log("🟢 로그인 버튼 클릭됨");
    try {
      const result = await promptAsync();
      console.log("🔵 promptAsync 호출 결과:", result);

      if (result.type === "success" && result.params.code) {
        const code = result.params.code;
        console.log("인가 코드:", code);
      } else {
        console.error(" 인가 코드가 없습니다.");
        setIsError(true);
      }
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      setIsError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_login.png")}
        style={styles.logo}
      />

      <View style={styles.errorContainer}>
        {isError && (
          <Text style={styles.errorMessage}>
            Oops! Something went wrong! Please try again!
          </Text>
        )}
      </View>

      <Pressable style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Image
          source={require("@/assets/images/kakao.png")}
          style={styles.kakaoIcon}
        />
        <Text style={styles.kakaoText}>Login with Kakao</Text>
      </Pressable>

      <Text style={styles.termsText}>
        By clicking continue, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    paddingHorizontal: 24,
  },
  logo: {
    top: -30,
    width: 300,
    height: 300,
    marginBottom: 40,
    resizeMode: "contain",
  },
  kakaoButton: {
    top: -64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.KAKAO,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 40,
    width: 360,
    height: 44,
  },
  kakaoIcon: {
    width: 24,
    height: 24,
    left: -90,
  },
  kakaoText: {
    color: colors.BLACK,
    fontSize: 16,
    textAlign: "center",
    left: -10,
  },
  termsText: {
    fontSize: 12,
    color: colors.GRAY_600,
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: colors.BLACK,
    fontWeight: "400",
  },
  errorMessage: {
    color: colors.RED_500,
    fontSize: 14,
    textAlign: "center",
    bottom: 10,
  },
  errorContainer: {
    top: -64,
    height: 20,
    justifyContent: "center",
  },
});
