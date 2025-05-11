import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function TabIndex() {
  const router = useRouter();
  const [isVisited, setIsVisited] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "sway",
    path: "redirect",
  });

  console.log(redirectUri);

  const handleGoToAuth = () => {
    // 임시 버튼
    router.push("/auth/signIn");
  };

  const clearKakaoTokens = async () => {
    try {
      // 각 토큰 개별 삭제
      await AsyncStorage.removeItem("kakaoAccessToken");
      await AsyncStorage.removeItem("kakaoRefreshToken");
      console.log(" 카카오 토큰 초기화 완료");
    } catch (error) {
      console.error(" 토큰 초기화 실패:", error);
    }
  };

  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     try {
  //       const isValidToken = await validateToken();

  //       if (isValidToken) {
  //         console.log("✅ 이미 로그인된 상태");
  //       } else {
  //         console.log("🚫 토큰 없음 또는 만료, 로그인 필요");
  //         router.replace("/auth/signIn");
  //       }
  //     } catch (error) {
  //       console.error("로그인 상태 확인 중 오류:", error);
  //       router.replace("/auth/signIn");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  // if (isLoading) {
  //   // 로딩 중에는 빈 화면 표시
  //   return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  // }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>임시</Text>
      <Pressable
        onPress={handleGoToAuth}
        style={({ pressed }) => ({
          backgroundColor: pressed ? "lightgray" : "#000",
          paddingVertical: pressed ? 10 : 12,
          paddingHorizontal: pressed ? 22 : 24,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>이동하기</Text>
      </Pressable>
      <Pressable onPress={clearKakaoTokens}>
        <Text>카카오 토큰 초기화</Text>
      </Pressable>
    </View>
  );
}

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//         try {
//             const userToken = await AsyncStorage.getItem('userToken');
//             if (!userToken) {
//                 router.replace('/auth/auth-home');
//             }
//         } catch (error) {
//             console.error(error);
//             router.replace('/auth/login-fail');
//         }
//     };

//     checkAuthStatus();
// }, []);
// -> 로그인 실패시 시 Auth로 넘어가는 임시 로직입니다.
