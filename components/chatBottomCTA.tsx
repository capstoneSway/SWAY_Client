import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatBottomCTAProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const ChatInput: React.FC<ChatBottomCTAProps> = ({
  value,
  onChangeText,
  onSend,
  containerStyle,
  inputStyle,
}) => {
  const insets = useSafeAreaInsets();

  const isEnabled = value.length > 0;

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { paddingBottom: insets.bottom || 12 },
      ]}
    >
      <View style={styles.hairline} />

      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, inputStyle]}
          multiline
          underlineColorAndroid="transparent"
          textAlignVertical="center"
        />

        <Pressable
          onPress={() => onSend(value)}
          disabled={!isEnabled}
          style={[
            styles.sendButton,
            {
              backgroundColor: isEnabled ? colors.PURPLE_300 : colors.GRAY_300,
            },
          ]}
        >
          <Ionicons name="arrow-up" size={16} color={colors.WHITE} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    marginLeft: 5,
    width: "105%",
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
  },
  hairline: {
    width: "120%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.GRAY_300,
    alignSelf: "center",
    marginBottom: 12,
  },
  inputWrapper: {
    position: "relative",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: colors.GRAY_300,
    borderRadius: 12,
    backgroundColor: colors.WHITE,
    // ✅ 핵심 수정
    width: "100%", // 부모의 padding 반영됨
    // ❌ alignSelf: "center" 제거!
    // ❌ maxWidth도 제거! (PC 화면 아닌 이상 필요 없음)
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  sendButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default ChatInput;
