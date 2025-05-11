import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { extractNicknameFromToken } from "@/utils/fetchNameFromToken";
import { saveNicknameToStorage } from "@/utils/saveNickname";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUsername() {
  const [username, setUsername] = useState(""); // 전역 용
  const [swayNickname, setSwayNickname] = useState(""); // 제출용 닉네임
  const [title, setTitle] = useState("Welcome, [Username]👋");
  const [subtitle, setSubtitle] = useState("Set up your nickname!");
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 사용자 이름이 idToken 안에 들어가 있는데, 이게 JWT 형식인 것 같습니다.
    // <header>.<payload>.<signature>가 있으면 . 기준으로 스플릿해서 인덱스 1번, 페이로드 가져옵니다.
    // util화 하였습니다.
    const initUsername = async () => {
      const fetchedName = await extractNicknameFromToken();
      if (fetchedName) {
        setUsername(fetchedName);
        setTitle(`Welcome, ${fetchedName}👋`);
      }
    };

    initUsername();
  }, []);

  const handleSubmit = async () => {
    try {
      console.log("username: ", swayNickname);
      // util로 뺐습니다.
      await saveNicknameToStorage(swayNickname);

      // 다음 화면으로 이동
      router.push("./signNationality");
    } catch (error) {
      console.error("닉네임 저장 중 오류:", error);
    }
  };

  const checkNickname = async () => {
    const storedNickname = await AsyncStorage.getItem("userNickname");
    console.log("저장된 닉네임:", storedNickname);
  };

  const handleNicknameChange = (text: string) => {
    const trimmedText = text.trim();
    setSwayNickname(trimmedText);

    // 더미 중복 검사 (50% 확률)
    const isTaken = Math.random() < 0.5;

    if (trimmedText.length > 0) {
      if (isTaken) {
        setTitle("Oops! Already taken 😅");
        setSubtitle("Try a different one!");
        setMessage("This nickname is already taken.");
        setButtonEnabled(false);
      } else {
        setTitle("Pick a nickname ✨");
        setSubtitle("It'll show up when you join meetups");
        setMessage("This nickname is available.");
        setButtonEnabled(true);
      }
    }

    if (trimmedText.length === 0) {
      setTitle(`Welcome, ${username}👋`);
      setSubtitle("Set up your nickname!");
      setMessage(""); // 메시지 초기화
      setButtonEnabled(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    >
      {/* 제목 */}
      <Text style={styles.title}>{title}</Text>
      {/* 부제목 */}
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* 유저네임 입력필드 */}
      <TextInput
        style={[
          styles.input,
          title === "Oops! Already taken 😅"
            ? styles.errorInput
            : title === "Pick a nickname ✨"
            ? styles.availableInput
            : {},
        ]}
        placeholder="Type here!"
        placeholderTextColor={colors.GRAY_500}
        value={swayNickname}
        onChangeText={handleNicknameChange}
      />

      {/* 메시지 */}
      <View style={styles.messageContainer}>
        {message ? (
          <Text
            style={[
              styles.message,
              message.includes("available")
                ? styles.availableMessage
                : styles.errorMessage,
            ]}
          >
            {message}
          </Text>
        ) : (
          <Text style={styles.message}></Text>
        )}
      </View>

      {/* 다음 버튼 */}
      <FixedBottomCTA
        label="Next"
        enabled={buttonEnabled}
        onPress={handleSubmit}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
  },
  title: {
    top: -48,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.BLACK,
  },
  subtitle: {
    top: -48,
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: colors.BLACK,
  },
  input: {
    top: -36,
    width: "100%",
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: colors.GRAY_100,
    fontSize: 16,
    color: colors.BLACK,
  },
  errorInput: {
    backgroundColor: colors.RED_100,
    borderColor: colors.RED_500,
    borderWidth: 1,
  },

  availableInput: {
    backgroundColor: colors.PURPLE_100,
    borderColor: colors.PURPLE_300,
    borderWidth: 1,
  },

  messageContainer: {
    top: -36,
    height: 24,
    marginBottom: 24,
    justifyContent: "flex-start",
  },
  message: {
    fontSize: 14,
  },
  availableMessage: {
    color: colors.PURPLE_300,
  },
  errorMessage: {
    color: colors.RED_500,
  },
});
