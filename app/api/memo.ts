// memo.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";

export interface Memo {
  id: string;
  date: string;
  rate: number;
  from: string;
  to: string;
  amount: number;
  text: string;
}

// 1) 메모 목록 조회
export const fetchMemos = async (): Promise<Memo[]> => {
  const jwtAccessToken = await AsyncStorage.getItem("jwt_access"); // ① 토큰 꺼내기
  const headers = jwtAccessToken
    ? { Authorization: `Bearer ${jwtAccessToken}` }
    : {};
  const response = await api.get<Memo[]>("/memos/", { headers }); // ② 헤더에 붙여 호출
  return response.data;
};

// 2) 메모 저장
export const postMemo = async (memo: {
  from: string;
  to: string;
  amount: number;
  text: string;
<<<<<<< HEAD
}) => api.post("/memos", memo); // POST /memos
=======
}): Promise<Memo> => {
  const jwtAccessToken = await AsyncStorage.getItem("jwt_access"); // ① 토큰 꺼내기
  const headers = jwtAccessToken
    ? { Authorization: `Bearer ${jwtAccessToken}` }
    : {};
  const response = await api.post<Memo>("/memos/", memo, { headers }); // ② 헤더에 붙여 호출
  return response.data;
};
>>>>>>> origin/login
