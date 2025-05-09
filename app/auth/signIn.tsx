import {
  View,
  Text,
  Image,
  Pressable,
  Linking,
  ScrollView,
} from "react-native";
import { router, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { colors } from "@/constants/color";

export default function AuthHome() {
  const [isError, setIsError] = useState(false);
  // const router = useRouter();

  const handleKakaoLogin = async () => {
    try {
      // 카카오 로그인 로직 (실패 시 에러 메시지 표시)
      const success = Math.random() > 0.5; // 임시 성공/실패 로직
      if (!success) {
        setIsError(true);
        throw new Error("Login failed");
      }

      // 최초 로그인이 여부 판별해야 하나, 일단 테스트로 닉 설정 진행.
      router.replace("./signUsername");
    } catch (error) {
      console.error("Login error:", error);
      setIsError(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("@/assets/images/logo_login.png")}
        style={styles.logo}
      />

      {isError && ( // 찐빠 시만 표시
        <Text style={styles.errorMessage}>
          Oops! Something went wrong! Please try again!
        </Text>
      )}

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
    </ScrollView>
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
    width: 300,
    height: 300,
    marginBottom: 40,
    resizeMode: "contain",
  },

  kakaoButton: {
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
});
