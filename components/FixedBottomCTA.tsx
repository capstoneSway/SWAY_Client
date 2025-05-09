import { colors } from "@/constants/color";
import React from "react";
import { View, Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FixedBottomCTAProps {
  label: string;
  enabled: boolean; //활성화, 비활성화
  onPress: () => void;
  style?: ViewStyle;
}

const FixedBottomCTA: React.FC<FixedBottomCTAProps> = ({
  label,
  enabled,
  onPress,
  ...props
}) => {
  // Safe Area
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom || 12 }]}
      {...props}
    >
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
    backgroundColor: colors.WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.GRAY_300,
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    maxWidth: 400,
    zIndex: 10,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    maxWidth: 400,
    paddingHorizontal: 16,
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
