// auth/AuthHome.tsx
import { colors } from "@/constants/color";
import { SCOPES } from "@/constants/scope";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
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
import { api } from "../api/axios";
import fetchUserInfo from "../api/fetchUserInfo";
import refreshToken from "../api/refreshToken";

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

  const handleKakaoLogin = async () => {
    setIsError(false);
    setLoading(true);

    // 1) 로컬에 저장된 토큰 확인
    const existingAccess = await AsyncStorage.getItem("@jwt");
    const existingRefresh = await AsyncStorage.getItem("@refreshToken");
    console.log("🟢 기존 Access Token:", existingAccess);
    console.log("🟢 기존 Refresh Token:", existingRefresh);

    if (existingAccess) {
      // 2) 액세스 토큰 만료 시 리프레시 시도
      const [, payload] = existingAccess.split(".");
      const exp = JSON.parse(
        Buffer.from(
          payload.replace(/-/g, "+").replace(/_/g, "/") +
            "=".repeat((4 - (payload.length % 4)) % 4),
          "base64"
        ).toString()
      ).exp;
      const now = Date.now() / 1000;
      let accessToken = existingAccess;

      if (now >= exp && existingRefresh) {
        const data = await refreshToken();
        console.log("🟢 [테스트 버튼] 반환된 토큰들:", data);
        if (data?.access) {
          console.log("🟢 [테스트 버튼] 새로 받은 accessToken:", data.access);
          accessToken = data.access;
          const pairs: [string, string][] = [["@jwt", data.access]];
          if (data.refresh) {
            pairs.push(["@refreshToken", data.refresh]);
            console.log(
              "🟢 [테스트 버튼] 새로 받은 refreshToken:",
              data.refresh
            );
          }
          await AsyncStorage.multiSet(pairs);
        }
      }

      // 3) 사용자 정보 조회
      const userInfo = await fetchUserInfo(accessToken);
      console.log("🟢 fetchUserInfo 결과:", userInfo);
      setLoading(false);
      if (userInfo) {
        if (!userInfo.nickname) {
          console.log("🚧 닉네임 미설정, /auth/signUsername 로 이동");
          router.replace("/auth/signUsername");
        } else if (!userInfo.nationality) {
          console.log("🚧 국적 미설정, /auth/signNationality 로 이동");
          router.replace("/auth/signNationality");
        } else {
          console.log("✅ 모든 정보 설정 완료, 메인 탭으로 이동");
          router.replace("../(tabs)");
        }
        return;
      }

      // 조회 실패 시 WebView 재진입
      setShowWebView(true);
      return;
    }

    // 4) 토큰이 없을 때 WebView 로그인 플로우
    setLoading(false);
    setShowWebView(true);
  };

  const handleWebViewNavigation = async ({ url }: { url: string }) => {
    if (url.startsWith(REDIRECT_URI) && url.includes("code=")) {
      const code = new URL(url).searchParams.get("code");
      console.log("🟢 인가 코드:", code);
      setShowWebView(false);
      setLoading(true);
      try {
        const resp = await api.get("/accounts/login/kakao/callback/", {
          params: { code },
        });
        const { jwt_access, jwt_refresh } = resp.data;
        console.log("🟢 Access Token:", jwt_access);
        console.log("🟢 Refresh Token:", jwt_refresh);

        const pairs: [string, string][] = [["@jwt", jwt_access]];
        if (jwt_refresh) pairs.push(["@refreshToken", jwt_refresh]);
        await AsyncStorage.multiSet(pairs);

        const userInfo = await fetchUserInfo(jwt_access);
        console.log("🟢 fetchUserInfo 결과:", userInfo);
        setLoading(false);
        if (userInfo) {
          if (!userInfo.nickname) router.replace("/auth/signUsername");
          else if (!userInfo.nationality)
            router.replace("/auth/signNationality");
          else router.replace("../(tabs)");
        } else {
          setShowWebView(true);
        }
      } catch (e) {
        console.error("❌ 토큰 교환 오류:", e);
        setIsError(true);
        setLoading(false);
        setShowWebView(true);
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
        style={[
          styles.kakaoButton,
          (showWebView || loading) && { opacity: 0.6 },
        ]}
        onPress={handleKakaoLogin}
        disabled={showWebView || loading}
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

      {/* RefreshToken 테스트 버튼 */}
      <Pressable
        style={[styles.kakaoButton, { backgroundColor: "#ccc" }]}
        onPress={async () => {
          console.log("🟢 [테스트 버튼] RefreshToken 호출 시작");
          try {
            const data = await refreshToken();
            console.log("🟢 [테스트 버튼] refreshToken 결과:", data);
            if (!data) {
              console.warn(
                "⚠️ [테스트 버튼] refreshToken이 null을 반환했습니다."
              );
              return;
            }
            console.log("🟢 [테스트 버튼] 새로 받은 accessToken:", data.access);
            const pairs: [string, string][] = [["@jwt", data.access]];
            if (data.refresh) {
              pairs.push(["@refreshToken", data.refresh]);
              console.log(
                "🟢 [테스트 버튼] 새로 받은 refreshToken:",
                data.refresh
              );
            }
            await AsyncStorage.multiSet(pairs);
            console.log("🟢 [테스트 버튼] AsyncStorage 업데이트 완료");
          } catch (err) {
            console.error("❌ [테스트 버튼] 재발급 에러:", err);
          }
        }}
      >
        <Text>🔄 RefreshToken 테스트</Text>
      </Pressable>

      {/* AsyncStorage 초기화 버튼 */}
      <Pressable
        style={[styles.kakaoButton, { backgroundColor: "#FF5252" }]}
        onPress={async () => {
          try {
            await AsyncStorage.clear();
            console.log("🟢 AsyncStorage 초기화 완료");
          } catch (e) {
            console.error("❌ AsyncStorage 초기화 실패:", e);
          }
        }}
      >
        <Text style={styles.kakaoText}>🧹 AsyncStorage 초기화</Text>
      </Pressable>

      {/* Terms & Privacy */}
      <Text style={styles.termsText}>
        By clicking continue, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>

      {showWebView && (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: KAKAO_AUTH_URL }}
            incognito
            cacheEnabled={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={(e) => {
              handleWebViewNavigation({ url: e.url });
              return true;
            }}
            javaScriptEnabled
            domStorageEnabled
          />
          {loading && (
            <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
          )}
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
  logo: { width: 300, height: 300, resizeMode: "contain", marginBottom: 40 },
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
  kakaoIcon: { position: "absolute", left: 16, width: 24, height: 24 },
  kakaoText: { fontSize: 16, color: colors.BLACK },
  termsText: {
    marginTop: 80,
    fontSize: 12,
    color: colors.GRAY_600,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  link: { color: colors.BLACK, fontWeight: "400" },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.WHITE,
    zIndex: 10,
  },
});
