import FeedList from "@/components/FeedList";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet } from "react-native";

export default function BoardScreen() {
  //로그인 정보 관리 (나중에 백엔드 연동 시 변경)
  const [user, setUser] = useState({ id: 1 });

  return (
    <SafeAreaView style={styles.container}>
      <FeedList />
      {user.id && (
        <Pressable
          style={styles.writeButton}
          onPress={() => router.push("/post/newpost")}
        >
          <Ionicons name="pencil" size={32} color={colors.WHITE} />
        </Pressable>
      )}
    </SafeAreaView>
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
  },
});
