import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 이미지 로고 import
const logoImage = require("@/assets/images/logo_letter.png");

interface CommonHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function CommonHeader({
  title = "",
  showBackButton = false,
}: CommonHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* 왼쪽: SWAY 로고 */}
        <Image
          source={logoImage}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* 중앙: 제목 */}
        <View style={styles.center}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* 오른쪽: 알림 아이콘 */}
        <Pressable
          onPress={() => router.push("/notification")}
          hitSlop={10}
          style={styles.rightIcon}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.BLACK}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 65,
    paddingHorizontal: 16,
    position: "relative",
  },
  logoImage: {
    width: 70,
    height: 70,
    marginTop: 4.5,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.BLACK,
  },
  rightIcon: {
    marginLeft: "auto",
  },
});
