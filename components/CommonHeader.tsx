import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; 
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logoImage = require("@/assets/images/logo_letter.png");

interface CommonHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function CommonHeader({
  title,
  showBackButton = false,
}: CommonHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation(); 

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        {/* 왼쪽: 뒤로가기 or 로고 */}
        {showBackButton ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={colors.BLACK} />
          </Pressable>
        ) : (
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        )}

        {/* 중앙: 제목 */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* 오른쪽: 알림 아이콘 */}
        <Pressable
          onPress={() => router.push("/notification")}
          hitSlop={10}
          style={styles.iconButton}
        >
          <Ionicons
            name="notifications-outline"
            size={26}
            color={colors.BLACK}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_200,
  },
  headerRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    position: "relative",
  },
  logo: {
    height: 100,
    width: 100,
  },
  iconButton: {
    paddingLeft: 8,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: colors.BLACK,
  },
});
