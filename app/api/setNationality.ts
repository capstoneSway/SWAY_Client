import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

/**
 * 국적 설정
 * @param nationality 설정할 국가명
 */
export async function setNationality(nationality: string): Promise<void> {
  const token = await AsyncStorage.getItem("@jwt");
  await api.patch(
    "/accounts/set-nationality/",
    { nationality },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
