// app/_layout.tsx
import { colors } from "@/constants/color";
import emitter from "@/utils/eventEmitter";
import messaging from "@react-native-firebase/messaging";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 백그라운드 알림 수신
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📦 백그라운드 알림 수신:", remoteMessage);
});

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 포그라운드 + 종료 상태에서의 알림 수신 처리
  useEffect(() => {
    // 포그라운드 상태에서 푸시 알림 수신
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("📲 포그라운드 알림:", remoteMessage);

      // notification.tsx로 이벤트 전파
      emitter.emit("newNotification", remoteMessage);
    });

    // 종료 상태에서 푸시 알림 클릭으로 앱 실행될 때
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("종료 상태에서 알림으로 앱 실행됨:", remoteMessage);

          // 필요 시 알림 이벤트 전달
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
