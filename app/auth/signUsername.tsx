import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUsername() {
  // 유저네임 입력 필드 상태
  const [nickname, setNickname] = useState("");
  // 제목과 부제목 상태
  const [title, setTitle] = useState("Welcome, [Username]👋");
  const [subtitle, setSubtitle] = useState("Set up your nickname!");
  // 버튼 활성화 상태
  const [buttonEnabled, setButtonEnabled] = useState(false);

  const handleSubmit = () => {
    console.log("username: ", nickname);
    router.push("./signNationality");
  };

  // 유저네임 입력 변경 시 호출
  const handleNicknameChange = (text: string) => {
    setNickname(text); //인풋값 받아옴

    // 중복 찐빠는 50% 확률로 더미. 중복은 받아와야 함.
    const isTaken = Math.random() < 0.5;

    // 실제 로직 예상. 중복 기능 상담 필요.
    // try {
    //     const response = await axios.post('/api/nickname', { nickname });
    //     if (response.status === 200) { 200은 정상
    //         setStatus('available');
    //         setMessage('This nickname is available.');
    //     } else { 찐빠
    //         setStatus('taken');
    //         setMessage('This nickname is already taken.');
    //     }
    // } catch (error) { // 로드 못 했을 때
    //     setStatus('taken');
    //     setMessage('This nickname is already taken.');
    // }

    // 더미 상태 전환

    // 빈 값이 아닐 때만 버튼 활성화
    if (text.trim().length > 0) {
      if (isTaken) {
        // 유저네임 ㄴㄴ
        setTitle("Oops! Already taken 😅");
        setSubtitle("Try a different one!");
        setButtonEnabled(false);
      } else {
        // 유저네임 ㅇㅋ
        setTitle("Pick a nickname ✨");
        setSubtitle("It'll show up when you join meetups");
        setButtonEnabled(true);
      }
    } else {
      // 입력 전 기본 타이틀
      setTitle("Welcome, [Username]👋");
      setSubtitle("Set up your nickname!");
      setButtonEnabled(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/* 제목 */}
      <Text style={styles.title}>{title}</Text>
      {/* 부제목 */}
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* 유저네임 입력필드 */}

      <TextInput
        style={[
          styles.input,
          title === "Oops! Already taken 😅" ? styles.errorInput : {},
        ]}
        placeholder="Type here!"
        placeholderTextColor={colors.GRAY_600}
        value={nickname}
        onChangeText={handleNicknameChange}
      />

      {/* 다음버튼 */}
      {/* <Pressable
        style={[
          styles.button,
          buttonEnabled ? styles.buttonEnabled : styles.buttonDisabled,
        ]} // 찐빠 나면 스타일 변경
        disabled={!buttonEnabled} //찐빠나면 비활성화 처리
        onPress={() => {
          console.log("Nickname submitted:", nickname);
          router.push("./signCountry");
        }}
      >
        <Text style={styles.buttonText}>Next</Text>
      </Pressable> */}

      <FixedBottomCTA
        label="Next"
        enabled={buttonEnabled}
        onPress={handleSubmit}
      ></FixedBottomCTA>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.BLACK,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    color: colors.BLACK,
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 24,
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
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonEnabled: {
    backgroundColor: colors.PURPLE_300,
  },
  buttonDisabled: {
    backgroundColor: colors.GRAY_300,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
