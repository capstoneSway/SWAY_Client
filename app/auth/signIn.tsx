// auth/AuthHome.tsx
import { colors } from "@/constants/color";
import { SCOPES } from "@/constants/scope";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
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

const REST_API_KEY = "30ec7806d186838e36cbb3201fcc3fd5";
const REDIRECT_URI =
  "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/accounts/login/kakao/callback";

export default function AuthHome() {
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const KAKAO_AUTH_URL =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES.join(","))}` +
    `&prompt=login`;

  // handleKakaoLogin 수정
  const handleKakaoLogin = async () => {
    try {
      // 기존 JWT 토큰이 있는지 먼저 확인
      const existingAccessToken = await AsyncStorage.getItem("@jwt");

      if (existingAccessToken) {
        console.log("🟢 기존 JWT 발견:", existingAccessToken);
        router.replace("/auth/signUsername");
        return;
      }

      setIsError(false);
      setShowWebView(true);
    } catch (err) {
      console.error(" 토큰 초기화 오류:", err);
    }
  };

  // redirectURI로 로그인을 성공하면, 추가 요청 없이 자동으로 토큰이 담겨지는 구조더라구요. 따라서 kakaoAuth.ts가 불필요해 삭제했습니다.
  // injectedJS의 postMessage에서 받아온 데이터가 event.nativeEvent.data, 즉 토큰이 될 데이터입니다. 거기서 파싱합니다.
  const handleMessage = async (event: any) => {
    try {
      const jsonText = event.nativeEvent.data.trim();
      console.log("🟢 받은 JSON:", jsonText);

      const data = JSON.parse(jsonText);
      const { jwt_access, jwt_refresh } = data; // 파싱한 data에서 토큰만 가져옵니다.

      console.log("🟢 Access Token:", jwt_access);
      console.log("🟢 Refresh Token:", jwt_refresh);

      const pairs: [string, string][] = [["@jwt", jwt_access]];
      if (jwt_refresh) pairs.push(["@refreshToken", jwt_refresh]);
      await AsyncStorage.multiSet(pairs); // 즉 액세스와 리프레시 토큰은 pairs 라는 형태로 저장됩니다. 골뱅이는 키입니다.

      // 다음 화면으로 이동
      router.replace("/auth/signUsername");
    } catch (err) {
      console.error("❌ 토큰 처리 오류:", err);
      setIsError(true);
    } finally {
      // 무조건 웹뷰 닫기
      setShowWebView(false);
      setLoading(false);
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
        style={[styles.kakaoButton, showWebView && { opacity: 0.6 }]}
        onPress={handleKakaoLogin}
        disabled={loading}
      >
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

      {showWebView && (
        <View style={styles.webviewContainer}>
          {loading && (
            <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
          )}
          <WebView
            source={{ uri: KAKAO_AUTH_URL }}
            incognito
            cacheEnabled={false}
            injectedJavaScript={`
              (function() {
                const jsonText = document.body.innerText.trim();
                try {
                  const data = JSON.parse(jsonText);
                  window.ReactNativeWebView.postMessage(jsonText); // 웹뷰에서 앱으로 데이터 전송.
                } catch (e) {
                  console.error("🛑 JSON 파싱 실패:", e, jsonText);
                }
              })();
              true;
            `}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      )}
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
    top: -20,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 40,
  },
  errorMessage: {
    color: colors.RED_500,
    marginBottom: 16,
    textAlign: "center",
  },
  kakaoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.KAKAO,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    height: 44,
    marginBottom: 20,
  },
  kakaoIcon: {
    position: "absolute",
    left: 16,
    width: 24,
    height: 24,
  },
  kakaoText: {
    fontSize: 16,
    color: colors.BLACK,
  },
  termsText: {
    fontSize: 12,
    color: colors.GRAY_600,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  link: {
    color: colors.BLACK,
    fontWeight: "400",
  },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.WHITE,
    zIndex: 10,
  },
});
