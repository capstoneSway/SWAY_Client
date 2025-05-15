<<<<<<< HEAD
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
=======
import { colors } from "@/constants/color";
import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

export default function NewPostLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.BLACK,
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen
        name="newpost"
        options={{
          title: "New Post",
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              {({ pressed }) => (
                <Feather
                  name="arrow-left"
                  size={28}
                  color={colors.BLACK}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Stack>
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
  );
}
