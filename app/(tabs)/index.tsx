// app/(tabs)/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ensureValidToken from "../api/tokenManager";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await ensureValidToken();
      if (!token) {
        // 토큰이 없거나 갱신 실패 시 → AsyncStorage·쿠키 초기화 후 로그인 화면으로. 자동 로그인입니다. 그.. 리프레시 토큰까지 처리해요.
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
        await CookieManager.clearAll();
        router.replace("/auth/signIn");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/signIn")}
      >
        <Text style={styles.buttonText}>로그인 화면으로 이동</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logoutButton]}
        onPress={async () => {
          // 수동 로그아웃 버튼
          await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
          await CookieManager.clearAll();
          router.replace("/auth/signIn");
        }}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 24, marginBottom: 32, fontWeight: "600" },
  button: {
    width: "100%",
    padding: 14,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  logoutButton: { backgroundColor: "#FF3B30" },
  logoutText: { color: "#fff" },
});
