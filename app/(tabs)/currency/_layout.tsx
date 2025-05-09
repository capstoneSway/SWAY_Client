import { Stack } from "expo-router";

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
