import { colors } from "@/constants/color";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.BLACK,
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
          headerBackTitle: "ㅤ",
        }}
      />
<<<<<<< HEAD

=======
      <Stack.Screen
        name="post"
        options={{
          title: "New Post",
          headerShown: false,
        }}
      />
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
