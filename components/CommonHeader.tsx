import getUnreadCount from "@/app/api/notification/getUnreadCount";
import { colors } from "@/constants/color";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import messaging from "@react-native-firebase/messaging";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 수 갱신 함수
  const fetchUnread = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count || 0);
    } catch (e) {
      console.error("Failed to fetch unread count", e);
    }
  };

  // 포커스될 때마다 알림 수 갱신
  useFocusEffect(
    useCallback(() => {
      fetchUnread();
    }, [])
  );

  // FCM 수신 시에도 갱신
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async () => {
      fetchUnread();
    });
    return unsubscribe;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* 왼쪽: 뒤로가기 or 로고 이미지 */}
        {showBackButton ? (
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <AntDesign name="left" size={24} color={colors.BLACK} />
          </Pressable>
        ) : (
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}

        {/* 중앙: 제목 */}
        <View style={styles.center}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // 제목이 아이콘 클릭 막지 않도록
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
