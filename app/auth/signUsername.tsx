import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import fetchUserInfo from "../api/fetchUserInfo";
import { checkNickname, setNickname } from "../api/handleNickname";

export default function SignUsername() {
  const [username, setUsername] = useState("");
  const [swayNickname, setSwayNickname] = useState("");
  const [title, setTitle] = useState("Welcome, [Username]👋");
  const [subtitle, setSubtitle] = useState("Set up your nickname!");
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("@jwt");
        if (token) {
          const userInfo = await fetchUserInfo(token);
          if (userInfo?.username) {
            const parsed = userInfo.username.split("_")[0];
            setUsername(parsed);
            setTitle(`Welcome, ${parsed}👋`);
          }
        }
      } catch (e) {
        console.error("사용자 정보 로드 오류:", e);
      }
    };
    initUsername();
  }, []);

  const handleNicknameChange = async (text: string) => {
    const trimmed = text.trim();
    setSwayNickname(trimmed);
    setMessage("");
    setButtonEnabled(false);

    if (trimmed.length === 0) {
      setTitle(`Welcome, ${username}👋`);
      setSubtitle("Set up your nickname!");
      return;
    }

    setTitle("Checking availability...");
    setSubtitle("");

    try {
      const available = await checkNickname(trimmed);
      if (available) {
        setTitle("Pick a nickname ✨");
        setSubtitle("It'll show up when you join meetups");
        setMessage("This nickname is available.");
        setButtonEnabled(true);
      } else {
        setTitle("Oops! Already taken 😅");
        setSubtitle("Try a different one!");
        setMessage("This nickname is already taken.");
        setButtonEnabled(false);
      }
    } catch (e) {
      console.error("닉네임 확인 오류:", e);
      setTitle("Error checking nickname");
      setSubtitle("");
      setMessage("Could not verify nickname.");
      setButtonEnabled(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await setNickname(swayNickname);
      await AsyncStorage.setItem("userNickname", swayNickname);
      router.replace("./signNationality");
    } catch (e) {
      console.error("닉네임 설정 중 오류:", e);
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
        style={
          title === "Oops! Already taken 😅"
            ? [styles.input, styles.errorInput]
            : title === "Pick a nickname ✨"
            ? [styles.input, styles.availableInput]
            : styles.input
        }
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
    color: colors.PURPLE_300,
  },
});
