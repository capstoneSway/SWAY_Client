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
        {/* 왼쪽: 뒤로가기 or 로고 이미지 */}
        {showBackButton ? (
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={colors.BLACK} />
          </Pressable>
        ) : (
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}

        {/* 중앙: 제목 */}
        <Text style={styles.headerTitle}>{title}</Text>

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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 65,
    position: "relative",
  },
  logoImage: {
    width: 70,
    height: 70,
    marginTop: 3,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.BLACK,
  },
  rightIcon: {
    marginLeft: "auto",
  },
});
