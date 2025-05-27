import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";

export default function NotificationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={24} color="black" />
        <Text style={styles.headerTitle}>Notification</Text>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
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
