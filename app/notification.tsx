import { colors } from "@/constants/color";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NotificationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        {/* 왼쪽: 알림 아이콘 + 텍스트 */}
        <View style={styles.titleRow}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.headerTitle}>Notification</Text>
        </View>

        {/* 오른쪽: 닫기 버튼 */}
        <Pressable onPress={() => router.back()}>
          <Feather name="x-circle" size={24} color={colors.BLACK} />
        </Pressable>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.text}>알림 페이지입니다 📩</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
    backgroundColor: "white",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "gray",
  },
});
