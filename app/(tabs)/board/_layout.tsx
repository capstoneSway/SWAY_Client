import { Stack } from "expo-router";
import React from "react";

export default function BoardLayout() {
  return (
    <Stack>
      {/* 게시판 목록 화면 */}
      <Stack.Screen
        name="index"
        options={{ title: "Board", headerShown: false }}
      />

      {/* 게시글 상세 화면 */}
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
