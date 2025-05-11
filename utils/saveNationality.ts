import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveNationalityToStorage = async (
  nationality: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem("userNationality", nationality);
    console.log("국적 저장 완료:", nationality);
  } catch (error) {
    console.error("국적 저장 실패:", error);
  }
};
