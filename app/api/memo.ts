import { api } from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MemoDTO {
  id: number;
  content: string;
  from_currency: string;
  from_amount: number;
  to_amount: number;
  to_currency: string;
  exchange_rate: number;
  date: string;
  user: number;
}

/** 전체 메모를 가져옵니다 */
export async function fetchAllMemos(): Promise<MemoDTO[]> {
  const token = await AsyncStorage.getItem("@jwt");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // GET /memo/ 또는 /currency/memos/ 등 백에서 전체 조회용 엔드포인트
  const { data } = await api.get<{ memos: MemoDTO[] }>("/currency/memo/my/", {
    headers,
  });
  return data.memos;
}

// 서버에 메모 저장
export async function createMemo(
  from_currency: string,
  from_amount: number,
  to_amount: number,
  to_currency: string,
  exchange_rate: number,
  content: string
): Promise<MemoDTO> {
  const token = await AsyncStorage.getItem("@jwt");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await api.post<MemoDTO>(
    `/currency/memo/`,
    {
      from_amount,
      from_currency,
      to_amount,
      to_currency,
      exchange_rate,
      content,
    },
    { headers }
  );
  return data;
}

// 서버에서 메모 삭제
export async function deleteMemo(id: number): Promise<void> {
  const token = await AsyncStorage.getItem("@jwt");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  await api.delete(`/currency/memo/${id}/delete/`, {
    headers,
  });
}
