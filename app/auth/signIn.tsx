// AuthHome.tsx
import { colors } from "@/constants/color";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

export default function AuthHome() {
  const REST_API_KEY = "30ec7806d186838e36cbb3201fcc3fd5";
  const REDIRECT_URI = "http://127.0.0.1:8081/auth/signUsername";

  // 모달, 로딩, 에러 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // 요청할 권한들
  const SCOPES = [
    "account_email",
    "profile_image",
    "profile_nickname",
    "gender",
  ];
  const AUTH_URL =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES.join(","))}` +
    `&prompt=login`;

  // 로그인 버튼 누르면 모달 열기 + 에러 리셋
  const handleKakaoLogin = () => {
    setIsError(false);
    setLoading(true);
    setModalVisible(true);
  };

  // WebView가 로드할 URL을 가로채서 code 파라미터만 처리
  const handleShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    const { url } = event;
    if (url.startsWith(REDIRECT_URI) && url.includes("code=")) {
      const match = url.match(/[?&]code=([^&]+)/);
      const code = match ? decodeURIComponent(match[1]) : null;
      console.log("🟢 인가 코드:", code);
      setModalVisible(false);
      return false;
    }
    return true;
  };

  // WebView 로드 중 에러 발생 시
  const handleWebViewError = () => {
    setLoading(false);
    setModalVisible(false);
    setIsError(true);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_login.png")}
        style={styles.logo}
      />

      {/* 에러 메시지 */}
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

      {/* WebView 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setIsError(true);
        }}
      >
        {/* ─── 닫기 버튼 ─── */}
        <View style={styles.closeWrapper}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {/* ─── WebView ─── */}
        <View style={styles.webviewWrapper}>
          {loading && (
            <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
          )}
          <WebView
            source={{ uri: AUTH_URL }}
            originWhitelist={["*"]}
            startInLoadingState
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onError={handleWebViewError}
            onHttpError={handleWebViewError}
            injectedJavaScript={`
              // 시뮬레이터 테스트용: kakaotalk:// 링크 제거
              document.querySelectorAll('a').forEach(a => {
                if (a.href.startsWith('kakaotalk://')) a.remove();
              });
              true;
            `}
          />
        </View>
      </Modal>
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
  // 에러 영역
  errorContainer: {
    top: -64,
    height: 20,
    justifyContent: "center",
  },
  errorMessage: {
    color: colors.RED_500,
    fontSize: 14,
    textAlign: "center",
    bottom: 10,
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
  // ─── 닫기 버튼 래퍼 ───
  closeWrapper: {
    paddingTop: 64,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
    alignItems: "flex-start",
  },
  closeButton: {
    backgroundColor: colors.GRAY_200,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: 82,
    height: 32,
  },
  closeText: {
    fontSize: 14,
    color: colors.BLACK,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  // ─── WebView 래퍼 ───
  webviewWrapper: {
    flex: 1,
  },
});
