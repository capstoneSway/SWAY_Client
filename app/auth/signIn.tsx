// auth/AuthHome.tsx
import { colors } from "@/constants/color";
import { SCOPES } from "@/constants/scope";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
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
<<<<<<< HEAD
    try {
      const existingAccessToken = await AsyncStorage.getItem("@jwt");
      if (existingAccessToken) {
        console.log("🟢 기존 JWT 발견:", existingAccessToken);
        // 기존 토큰으로 사용자 정보 조회 및 분기
        const userInfo = await fetchUserInfo(existingAccessToken);
        if (userInfo) {
          if (userInfo.nickname === null) {
            router.replace("/auth/signUsername");
            return;
          } else if (userInfo.nationality === null) {
            router.replace("/auth/signNationality");
            return;
          } else {
            router.replace("../(tabs)");
            return;
          }
        }
      } else {
        // 토큰이 없으면 카카오 로그인 WebView 표시
        setIsError(false);
        setShowWebView(true);
      }
    } catch (err) {
      console.error("토큰 초기화 오류:", err);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const jsonText = event.nativeEvent.data.trim();
      console.log("🟢 받은 JSON:", jsonText);

      const data = JSON.parse(jsonText);
      const { jwt_access, jwt_refresh } = data;

      console.log("🟢 Access Token:", jwt_access);
      console.log("🟢 Refresh Token:", jwt_refresh);

      // 로컬 스토리지에 토큰 저장
      const pairs: [string, string][] = [["@jwt", jwt_access]];
      if (jwt_refresh) pairs.push(["@refreshToken", jwt_refresh]);
      await AsyncStorage.multiSet(pairs);

      // 사용자 정보 조회 및 분기
      const userInfo = await fetchUserInfo(jwt_access);
      if (userInfo) {
        if (userInfo.nickname === null) {
          router.replace("/auth/signUsername");
        } else if (userInfo.nationality === null) {
          router.replace("/auth/signNationality");
        } else {
          router.replace("../(tabs)");
=======
    setIsError(false);
    setLoading(true);

    // 1) AsyncStorage에서 기존 토큰 불러오기
    const existingAccess = await AsyncStorage.getItem("@jwt");
    const existingRefresh = await AsyncStorage.getItem("@refreshToken");
    console.log("🟢 기존 Access Token:", existingAccess);
    console.log("🟢 기존 Refresh Token:", existingRefresh);

    if (existingAccess) {
      // 2) 만료 여부 체크
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

      // 3) Access 토큰이 만료됐으면 Refresh 토큰으로 갱신
      if (now >= exp && existingRefresh) {
        const data = await refreshToken(existingRefresh);
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

      // 4) 사용자 정보 조회
      const userInfo = await fetchUserInfo(accessToken);
      console.log("🟢 fetchUserInfo 결과:", userInfo);
      setLoading(false);

      if (userInfo) {
        if (!userInfo.nickname) {
          console.log("🚧 닉네임 미설정 → /auth/signUsername");
          router.replace("/auth/signUsername");
        } else if (!userInfo.nationality) {
          console.log("🚧 국적 미설정 → /auth/signNationality");
          router.replace("/auth/signNationality");
        } else {
          console.log("✅ 모든 정보 설정 완료 → 메인 탭");
          router.replace("/"); // (tabs) 대신 루트("/")로 변경
        }
        return;
      }

      // 조회 실패 시 WebView 재진입
      setShowWebView(true);
      return;
    }

    // 5) 토큰이 없으면 WebView 로그인 플로우 시작
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
        // 6) 코드로 JWT 교환
        const resp = await api.get("/accounts/login/kakao/callback/", {
          params: { code },
        });
        const { jwt_access, jwt_refresh } = resp.data;
        console.log("🟢 Access Token:", jwt_access);
        console.log("🟢 Refresh Token:", jwt_refresh);

        // 7) AsyncStorage 저장
        const pairs: [string, string][] = [["@jwt", jwt_access]];
        if (jwt_refresh) pairs.push(["@refreshToken", jwt_refresh]);
        await AsyncStorage.multiSet(pairs);

        // 8) 사용자 정보 조회 후 라우팅
        const userInfo = await fetchUserInfo(jwt_access);
        console.log("🟢 fetchUserInfo 결과:", userInfo);
        setLoading(false);
        if (userInfo) {
          if (!userInfo.nickname) router.replace("/auth/signUsername");
          else if (!userInfo.nationality)
            router.replace("/auth/signNationality");
          else router.replace("/");
        } else {
          setShowWebView(true);
>>>>>>> origin/login
        }
      } catch (e) {
        console.error("❌ 토큰 교환 오류:", e);
        setIsError(true);
        setLoading(false);
        setShowWebView(true);
      }
    } catch (err) {
      console.error("❌ 토큰 처리 오류:", err);
      setIsError(true);
    } finally {
      // 무조건 웹뷰 닫기 및 로딩 해제
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
<<<<<<< HEAD
        style={[styles.kakaoButton, showWebView && { opacity: 0.6 }]}
=======
        style={[
          styles.kakaoButton,
          (showWebView || loading) && { opacity: 0.6 },
        ]}
>>>>>>> origin/login
        onPress={handleKakaoLogin}
        disabled={showWebView || loading}
      >
        <Image
          source={require("@/assets/images/kakao.png")}
          style={styles.kakaoIcon}
        />
        <Text style={styles.kakaoText}>Login with Kakao</Text>
      </Pressable>

      {/* RefreshToken 테스트 버튼 */}
      <Pressable
        style={[styles.kakaoButton, { backgroundColor: "#ccc" }]}
        onPress={async () => {
          console.log("🟢 [테스트 버튼] RefreshToken 호출 시작");
          try {
            const existingRefresh = await AsyncStorage.getItem("@refreshToken");
            if (!existingRefresh) {
              console.warn("⚠️ [테스트 버튼] 저장된 refreshToken이 없습니다.");
              return;
            }
            const data = await refreshToken(existingRefresh);
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

      {/* AsyncStorage + 쿠키 초기화(로그아웃 대체) */}
      <Pressable
        style={[styles.kakaoButton, { backgroundColor: "#FF5252" }]}
        onPress={async () => {
          try {
            await AsyncStorage.clear();
            console.log("🟢 AsyncStorage 초기화 완료");
            await CookieManager.clearAll();
            console.log("🟢 쿠키 초기화 완료");
          } catch (e) {
            console.error("❌ 초기화 실패:", e);
          }
        }}
      >
        <Text style={styles.kakaoText}>🧹 AsyncStorage + 쿠키 초기화</Text>
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
<<<<<<< HEAD
            injectedJavaScript={`
              (function() {
                const jsonText = document.body.innerText.trim();
                try {
                  const data = JSON.parse(jsonText);
                  window.ReactNativeWebView.postMessage(jsonText);
                } catch (e) {
                  console.error("🛑 JSON 파싱 실패:", e, jsonText);
                }
              })();
              true;
            `}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
=======
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={(e) => {
              handleWebViewNavigation({ url: e.url });
              return true;
            }}
            javaScriptEnabled
            domStorageEnabled
>>>>>>> origin/login
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
<<<<<<< HEAD
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 40,
  },
=======
  logo: { width: 300, height: 300, resizeMode: "contain", marginBottom: 40 },
>>>>>>> origin/login
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
<<<<<<< HEAD
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
=======
  kakaoIcon: { position: "absolute", left: 16, width: 24, height: 24 },
  kakaoText: { fontSize: 16, color: colors.BLACK },
>>>>>>> origin/login
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
