import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { saveNicknameToStorage } from "@/utils/saveNickname";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import fetchUserInfo from "../api/fetchUserInfo";

export default function SignUsername() {
  const [username, setUsername] = useState(""); // 전역 용
  const [swayNickname, setSwayNickname] = useState(""); // 제출용 닉네임
  const [title, setTitle] = useState("Welcome, [Username]👋");
  const [subtitle, setSubtitle] = useState("Set up your nickname!");
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");
  // Oops! Already taken 부분은 임시로 빼놓았습니다.
  useEffect(() => {
    // 가장 먼저 [Username]부분에 실명을 띄워야 해서 가져옵니다.
    const initUsername = async () => {
      try {
        const jwtAccessToken = await AsyncStorage.getItem("@jwt");
        if (jwtAccessToken) {
          const userInfo = await fetchUserInfo(jwtAccessToken);
          if (userInfo && userInfo.username) {
            // 이메일에서 이름 부분만 파싱 (언더바 이후 제거)
            const parsedUsername = userInfo.username.split("_")[0];
            setUsername(parsedUsername);
            setTitle(`Welcome, ${parsedUsername}👋`);
          }
        }
      } catch (error) {
        console.error("❌ 사용자 정보 로드 오류:", error);
      }
    };

    initUsername();
  }, []);

  const handleSubmit = async () => {
    try {
      console.log("username: ", swayNickname);
      await saveNicknameToStorage(swayNickname);
      router.push("./signNationality");
    } catch (error) {
      console.error("닉네임 저장 중 오류:", error);
    }
  };

  const handleNicknameChange = (text: string) => {
    const trimmedText = text.trim();
    setSwayNickname(trimmedText);

    if (trimmedText.length > 0) {
      setTitle("Pick a nickname ✨");
      setSubtitle("It'll show up when you join meetups");
      setMessage("This nickname is available.");
      setButtonEnabled(true);
    } else {
      setTitle(`Welcome, ${username}👋`);
      setSubtitle("Set up your nickname!");
      setMessage("");
      setButtonEnabled(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TextInput
        style={styles.input}
        placeholder="Type here!"
        placeholderTextColor={colors.GRAY_500}
        value={swayNickname}
        onChangeText={handleNicknameChange}
      />
      <View style={styles.messageContainer}>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
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
  messageContainer: {
    top: -36,
    height: 24,
    marginBottom: 24,
    justifyContent: "flex-start",
  },
  message: {
    fontSize: 14,
    color: colors.PURPLE_300,
  },
});
