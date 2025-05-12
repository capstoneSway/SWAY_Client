import { colors } from "@/constants/color";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet, View, Image, Text } from "react-native";

interface ProfileProps {
  onPress: () => void;
  nickname: string;
  imageUri?: string;
  createdAt: string;
  option?: ReactNode;
}

function Profile({ onPress, imageUri, nickname, createdAt, option }: ProfileProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.profileContainer} onPress={onPress}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/default_profile.png")
          }
          style={styles.profile}
        />
        <View style={{ gap: 4 }}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.createdAt}>{createdAt}</Text>
        </View>
      </Pressable>
      {option}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profile: {
    width: 50,
    height: 50,
  },
  nickname: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.BLACK,
  },
  createdAt: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
});

export default Profile;