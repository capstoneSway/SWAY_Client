import { colors } from "@/constants/color";
import { formatDate } from "@/utils/formatDate";
import { getFlagImage } from "@/utils/getFlagImage";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileProps {
  onPress?: () => void;
  nickname: string;
  imageUri?: string;
  createdAt: string;
  nationality?: string;
}

export default function Profile({
  onPress,
  imageUri,
  nickname,
  createdAt,
  nationality,
}: ProfileProps) {
  const flag = nationality ? getFlagImage(nationality) : null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/default_profile.png")
          }
          style={styles.avatar}
        />
        {flag && (
          <Image source={flag} style={styles.flagOverlay} />
        )}
      </View>

      <View>
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.createdAt}>{formatDate(createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.GRAY_200,
  },
  flagOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.WHITE,
    backgroundColor: colors.WHITE,
  },
  nickname: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.BLACK,
  },
  createdAt: {
    fontSize: 12,
    color: colors.GRAY_600,
  },
});
