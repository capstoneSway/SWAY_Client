// app/_layout.tsx
import { colors } from "@/constants/color";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false, // 모든 화면 기본 헤더 감추기
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          title: "Login",
          headerShown: true,
          headerTintColor: colors.BLACK,
          headerBackTitle: "ㅤ", // ← iOS에서 뒤로가기 텍스트 없애기
        }}
      />
      <Stack.Screen
        name="post"
        options={{
          title: "New Post",
          headerShown: false,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
