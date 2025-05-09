import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabIndex() {
  const router = useRouter();
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    const checkSplashVisit = async () => {
      try {
        const isFreshStart = !globalThis.isVisitedOnce;
        if (isFreshStart) {
          globalThis.isVisitedOnce = true; // 전역 플래그 설정
          await AsyncStorage.setItem("isVisited", "true");
          router.replace("/splash");
        } else {
          setIsVisited(true);
        }
      } catch (error) {
        console.error("Error checking splash visit:", error);
        setIsVisited(true); // 에러 시에도 메인 화면 표시
      }
    };

    checkSplashVisit();
  }, []);

  const handleGoToAuth = () => {
    router.push("/auth/signIn");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>탭 메인 화면</Text>
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
