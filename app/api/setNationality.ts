import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

/**
 * 국적 설정
 * @param nationality 국가명 (예: "South Korea")
 * @param nationalCode 국가 코드 (예: "KRW")
 */
export default async function setNationality(
  nationality: string,
  nationalCode: string
): Promise<void> {
  const token = await AsyncStorage.getItem("@jwt");
  await api.put(
    "/accounts/set-nationality/",
    {
      nationality,
      national_code: nationalCode,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
