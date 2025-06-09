import ensureValidToken from "@/app/api/tokenManager";
import { colors } from "@/constants/color";
import emitter from "@/utils/eventEmitter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchUserInfo } from "./api/fetchUserInfo";

// 플랫폼에 따라 CookieManager를 안전하게 불러옴
let CookieManager: any;
if (Platform.OS !== "web") {
  CookieManager = require("@react-native-cookies/cookies").default;
} else {
  CookieManager = {
    clearAll: async () => {},
  };
}

// 플랫폼에 따라 messaging safely 불러옴
let messaging: any = null;
if (Platform.OS !== "web") {
  messaging = require("@react-native-firebase/messaging").default;

  // 백그라운드 알림 수신
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log("📦 백그라운드 알림 수신:", remoteMessage);
  });
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // const [checkingAuth, setCheckingAuth] = useState(true);

  // // 토큰 유효성 검사 후 로그인 페이지로 이동
  // useEffect(() => {
  //   const checkToken = async () => {
  //     try {
  //       const token = await ensureValidToken();

  //       if (!token) {
  //         await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
  //         await CookieManager.clearAll();

  //         if (!pathname.startsWith("/auth")) {
  //           router.replace("/auth/signIn");
  //         }
  //         setCheckingAuth(false);

  //         return;
  //       }

  //       const user = await fetchUserInfo(token);

  //       if (!user.nickname && !pathname.includes("signUsername")) {
  //         router.replace("/auth/signUsername");
  //         return;
  //       }

  //       if (
  //         user.nickname &&
  //         !user.nationality &&
  //         !pathname.includes("signNationality")
  //       ) {
  //         router.replace("/auth/signNationality");
  //         return;
  //       }
  //     } catch (e) {
  //       router.replace("/auth/signIn");
  //     } finally {
  //       setCheckingAuth(false); // ✅ 무조건 실행
  //     }
  //   };

  //   checkToken();
  // }, []);

  // 5분 검사 로직
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = await ensureValidToken();

        if (!token) {
          console.warn("⛔️ Token expired or invalid. Logging out.");
          await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
          await CookieManager.clearAll();
          if (!pathname.startsWith("/auth")) {
            router.replace("/auth/signIn");
          }
          return;
        }

        const user = await fetchUserInfo(token);

        if (!user.nickname && !pathname.includes("signUsername")) {
          router.replace("/auth/signUsername");
          return;
        }

        if (
          user.nickname &&
          !user.nationality &&
          !pathname.includes("signNationality")
        ) {
          router.replace("/auth/signNationality");
          return;
        }
      } catch (e) {
        console.error("⚠️ User info fetch failed during interval:", e);
        router.replace("/auth/signIn");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 포그라운드 + 종료 상태에서의 알림 수신 처리
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.log("📲 포그라운드 알림:", remoteMessage);
      emitter.emit("newNotification", remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log("🚪 종료 상태에서 알림으로 앱 실행됨:", remoteMessage);
          emitter.emit("newNotification", remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth"
        options={{
          title: "Login",
          headerShown: true,
          headerTintColor: colors.BLACK,
          headerBackTitle: "ㅤ",
        }}
      />
      <Stack.Screen
        name="post"
        options={{ title: "New Post", headerShown: false }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
