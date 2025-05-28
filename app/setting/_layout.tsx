// 📁 app/setting/_layout.tsx

import { Stack } from "expo-router";
import React from "react";

export default function SettingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="feedback" />
      <Stack.Screen name="restriction" />
      <Stack.Screen name="blocked" />
    </Stack>
  );
}
