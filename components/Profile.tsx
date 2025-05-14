import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/color";

interface ProfileProps {
  onPress?: () => void;
  nickname: string;
  imageUri?: string;
  createdAt: string;
}

export default function Profile({ onPress, imageUri, nickname, createdAt }: ProfileProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        source={imageUri ? { uri: imageUri } : require("@/assets/images/default_profile.png")}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.createdAt}>{createdAt}</Text>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.GRAY_200,
    marginRight: 10,
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
