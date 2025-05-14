import { Stack } from "expo-router";
import React from "react";

export default function CurrencyLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Currency", headerShown: true }}
      />
    </Stack>
  );
}
