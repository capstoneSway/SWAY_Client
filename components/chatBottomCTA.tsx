import { colors } from "@/constants/color";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
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
  onImagePicked?: (uri: string) => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatBottomCTAProps> = ({
  value,
  onChangeText,
  onSend,
  containerStyle,
  inputStyle,
  onImagePicked,
  disabled,
}) => {
  const insets = useSafeAreaInsets();

  const isEnabled = value.length > 0;

  // 갤러리 권한 체크 후 이미지 선택 함수
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        onImagePicked?.(uri); // ✅ 상위에 콜백 전달
      }
    } catch (error) {
      Alert.alert("오류", "이미지 선택 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

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
        <Pressable
          onPress={disabled ? undefined : pickImage}
          disabled={disabled}
          style={({ pressed }) => [
            styles.imageButton,
            {
              opacity: disabled ? 0.3 : pressed ? 0.5 : 1,
            },
          ]}
        >
          <Feather name="image" size={28} color={disabled ? "#ccc" : "black"} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, inputStyle, disabled && { color: "#aaa" }]}
          editable={!disabled}
          multiline
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          autoCapitalize="none"
          spellCheck={false}
          importantForAutofill="no"
          autoComplete="off"
          autoCorrect={false}
          placeholder={disabled ? "This chat has expired." : undefined}
        />

        <Pressable
          onPress={() => onSend(value)}
          disabled={disabled || !isEnabled}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                !disabled && isEnabled ? colors.PURPLE_300 : colors.GRAY_300,
              opacity: pressed && !disabled && isEnabled ? 0.5 : 1,
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
    paddingLeft: 4,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: colors.GRAY_300,
    borderRadius: 12,
    backgroundColor: colors.WHITE,
    width: "100%",
  },
  imageButton: {
    marginRight: 8,
    paddingHorizontal: 4,
    left: 6,
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
    right: 16,
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
