// components/AvatarWithFlag.tsx
import { colors } from "@/constants/color";
import { getFlagImage } from "@/utils/getFlagImage";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface Props {
  uri?: string;
  nationality?: string;
  size?: number;
}

export default function AvatarWithFlag({ uri, nationality, size = 36 }: Props) {
  const flag = nationality ? getFlagImage(nationality) : null;

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={uri ? { uri } : require("@/assets/images/default_profile.png")}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      {flag && <Image source={flag} style={styles.flagOverlay} />}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
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
});
