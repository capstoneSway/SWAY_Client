import CommonHeader from "@/components/CommonHeader";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <CommonHeader />
      <View style={styles.content}>
        <Text style={styles.text}>알림 페이지입니다 📩</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
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
