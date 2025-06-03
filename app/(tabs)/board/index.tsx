import CommonHeader from "@/components/CommonHeader";
import FeedList from "@/components/FeedList";
import { colors } from "@/constants/color";
import { StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

export default function BoardScreen() {
  return (
    <View style={styles.container}>
      <CommonHeader title="Board" />
      <FeedList />

      <Pressable
        style={styles.writeButton}
        onPress={() => router.push("/post/newpost")}
      >
        <Ionicons name="pencil" size={32} color={colors.WHITE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  writeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.PURPLE_300,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 2,
    zIndex: 10,
  },
});
