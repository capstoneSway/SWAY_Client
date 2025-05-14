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
import fetchUserInfo from "../api/fetchUserInfo";

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
    try {
      const existingAccessToken = await AsyncStorage.getItem("@jwt");
      if (existingAccessToken) {
        console.log("🟢 기존 JWT 발견:", existingAccessToken);
        // 기존 토큰으로 사용자 정보 조회 및 분기
        const userInfo = await fetchUserInfo(existingAccessToken);
        if (userInfo) {
          if (!userInfo.nickname || userInfo.nickname.trim() === "") {
            router.replace("/auth/signUsername");
            return;
          } else if (
            !userInfo.nationality ||
            userInfo.nationality.trim() === ""
          ) {
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
        if (!userInfo.nickname || userInfo.nickname.trim() === "") {
          router.replace("/auth/signUsername");
        } else if (
          !userInfo.nationality ||
          userInfo.nationality.trim() === ""
        ) {
          router.replace("/auth/signNationality");
        } else {
          router.replace("../(tabs)");
        }
      }
    } catch (err) {
      console.error("❌ 토큰 처리 오류:", err);
      setIsError(true);
    } finally {
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
