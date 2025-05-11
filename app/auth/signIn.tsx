import { colors } from "@/constants/color";
import { SCOPES } from "@/constants/scope";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { exchangeKakaoCode } from "../api/kakaoAuth";

export default function AuthHome() {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  const REDIRECT_URI = "http://127.0.0.1:8081/auth/signUsername";
  const REST_API_KEY = "30ec7806d186838e36cbb3201fcc3fd5"; //클라이언트 아디
  const KAKAO_AUTH_URL =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES.join(","))}` + // constants
    "&prompt=login";

  const handleKakaoLogin = () => {
    setLoading(true);
    setIsError(false);
    // WebView 띄우기
    setShowWebView(true);
  };

  const handleWebViewNavigation = async (event: { url: string }) => {
    const { url } = event;
    if (loading) setLoading(false);

    if (url.startsWith(REDIRECT_URI) && url.includes("code=")) {
      const code = new URL(url).searchParams.get("code");
      console.log("🟢 인가 코드:", code);
      setShowWebView(false);
      if (code) {
        try {
          const { accessToken, refreshToken } = await exchangeKakaoCode(code);
          // 인가 코드 주고 토큰 받고, 일단 jwt 디코딩 ( me()로 받아와도 되고 )
          // !!!!!!!!!1 GET/POST	https://kapi.kakao.com/v2/user/me 에서 가져올 예정. 디코딩은 그냥 임시.
          const { sub: email, userId } = jwtDecode<{
            sub: string;
            userId: string;
          }>(accessToken);
          // 스토리지에 저장

          await AsyncStorage.multiSet([
            ["@accessToken", accessToken],
            ["@refreshToken", refreshToken],
            ["@email", email],
            ["@userId", userId],
          ]);

          router.replace("/auth/signUsername");
        } catch (err) {
          console.error("코드 교환 실패:", err);
          setIsError(true);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_login.png")}
        style={styles.logo}
      />

      {isError && (
        <Text style={styles.errorMessage}>
          Oops! Something went wrong! Please try again!
        </Text>
      )}

      <Pressable
        style={styles.kakaoButton}
        onPress={handleKakaoLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.BLACK} />
        ) : (
          <>
            <Image
              source={require("@/assets/images/kakao.png")}
              style={styles.kakaoIcon}
            />
            <Text style={styles.kakaoText}>Login with Kakao</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.termsText}>
        By clicking continue, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>

      {/* WebView with incognito to clear cookies */}
      {showWebView && (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: KAKAO_AUTH_URL }}
            incognito={true} // 세션·쿠키 초기화
            cacheEnabled={false}
            sharedCookiesEnabled={false}
            onNavigationStateChange={handleWebViewNavigation}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
            )}
          />
        </View>
      )}
    </View>
  );
}

// button onPress -> setShowWebView(True) -> showWebView

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
  errorMessage: {
    color: colors.RED_500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
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
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: colors.WHITE,
  },
});
