import { colors } from "@/constants/color";
import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface CommentItemProps {
  nickname: string;
  content: string;
  createdAt: string;
  likes?: number;
  profileUri?: string;
  onPressMenu?: () => void;
  onPressReply?: () => void;
  isReply?: boolean;
}

export default function CommentItem({
  nickname,
  content,
  createdAt,
  likes = 0,
  profileUri,
  onPressMenu,
  onPressReply,
  isReply = false,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((prev) => (next ? prev + 1 : prev - 1));
  };

  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <View style={[styles.wrapper, { paddingLeft: isReply ? 32 : 0 }]}>      
      <View style={styles.container}>
        <Image
          source={
            profileUri
              ? { uri: profileUri }
              : require("@/assets/images/default_profile.png")
          }
          style={styles.profileImage}
        />

        <View style={styles.rightContent}>
          <View style={styles.topRow}>
            <Text style={styles.nickname}>{nickname}</Text>
            <View style={styles.iconGroup}>
              <Pressable onPress={toggleLike} style={styles.iconButton}>
                <AntDesign
                  name={isLiked ? "hearto" : "hearto"}
                  size={14}
                  color={colors.BLACK}
                />
              </Pressable>

              <Text style={styles.separator}>|</Text>

              <Pressable style={styles.iconButton} onPress={onPressReply}>
                <FontAwesome6 name="comment" size={14} color={colors.BLACK} />
              </Pressable>

              <Text style={styles.separator}>|</Text>

              <Pressable onPress={onPressMenu}>
                <Entypo
                  name="dots-three-vertical"
                  size={14}
                  color={colors.BLACK}
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.commentContent}>{content}</Text>

          <View style={styles.metaRow}>
            {likeCount > 0 ? (
              <>
                <AntDesign
                  name="heart"
                  size={12}
                  color={colors.RED_500}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.metaText}>
                  {likeCount} | {formattedDate}
                </Text>
              </>
            ) : (
              <Text style={styles.metaText}>{formattedDate}</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: colors.WHITE,
    borderRadius: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  rightContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nickname: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.BLACK,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    paddingHorizontal: 4,
  },
  separator: {
    color: colors.BLACK,
    marginHorizontal: 6,
    fontSize: 12,
    lineHeight: 16,
  },
  commentContent: {
    fontSize: 14,
    color: colors.GRAY_800,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.GRAY_200,
    marginTop: 8,
    marginLeft: 46,
  },
});
