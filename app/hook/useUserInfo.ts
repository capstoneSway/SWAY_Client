import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserInfo } from "@/app/api/fetchUserInfo";

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<{ id: number } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const user = await fetchUserInfo(token);
        setUserInfo(user);
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
      }
    };
    loadUser();
  }, []);

  return { userInfo };
}