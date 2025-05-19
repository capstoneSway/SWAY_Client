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
        headerShown: false, //  모든 화면 기본 헤더 감추기!
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
