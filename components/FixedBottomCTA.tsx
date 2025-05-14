import { colors } from "@/constants/color";
import React from "react";
import { View, Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FixedBottomCTAProps {
  label: string;
  enabled: boolean; // 활성화, 비활성화 상태
  onPress: () => void;
  style?: ViewStyle;
}

const FixedBottomCTA: React.FC<FixedBottomCTAProps> = ({
  label,
  enabled,
  onPress,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, style, { paddingBottom: insets.bottom || 12 }]}
    >
      {/* 헤어라인 */}
      <View style={styles.hairline} />

      {/* 버튼 */}
      <Pressable
        style={[styles.button, enabled ? styles.enabled : styles.disabled]}
        onPress={onPress}
        disabled={!enabled}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  hairline: {
    width: "120%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.GRAY_300,
    marginBottom: 12,
  },
  button: {
    width: "105%",
    maxWidth: 400,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  enabled: {
    backgroundColor: colors.PURPLE_300,
  },
  disabled: {
    backgroundColor: colors.GRAY_300,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FixedBottomCTA;
