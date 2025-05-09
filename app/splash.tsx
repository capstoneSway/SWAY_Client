import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/color";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // 3초 후 메인 화면으로 이동
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo_splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.PURPLE_300,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 320,
  },
});
