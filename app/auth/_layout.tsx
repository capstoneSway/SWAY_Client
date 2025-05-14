import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signIn"
        options={{ title: "LogIn", headerShown: false }}
      />
      <Stack.Screen
        name="signUsername"
        options={{ title: "LogIn", headerShown: false }}
      />
      <Stack.Screen
        name="signNationality"
        options={{ title: "LogIn", headerShown: false }}
      />
    </Stack>
  );
}
