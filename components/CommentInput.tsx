import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/color";

export default function CommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [comment, setComment] = useState("");

  const handlePost = () => {
    if (!comment.trim()) return;
    onSubmit(comment);
    setComment(""); // 입력 후 초기화
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment..."
        style={styles.input}
        multiline
      />
      <Pressable onPress={handlePost}>
        <Feather name="arrow-up-circle" size={24} color={colors.PURPLE_300} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.GRAY_100,
    borderRadius: 20,
    marginRight: 8,
  },
});
