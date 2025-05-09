import { Stack } from "expo-router";

export default function BoardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Board", headerShown: true }}
      />
    </Stack>
  );
}
