import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveNicknameToStorage = async (
  nickname: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem("userNickname", nickname);
    console.log("닉네임 저장 완료:", nickname);
  } catch (error) {
    console.error("닉네임 저장 실패:", error);
  }
};
