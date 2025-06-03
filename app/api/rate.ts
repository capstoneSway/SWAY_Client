// app/api/rate.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./axios";
import { currencies } from "@/constants/currency";

// ── 응답 타입 정의 ──
// today + history 엔드포인트용
export interface HistoryItem {
  date: string; // "YYYY-MM-DD"
  rate: number;
}
export interface HistoryResponse {
  today: {
    date: string;
    cur_unit: string;
    cur_nmf: string;
    rate: number;
  };
  history: HistoryItem[];
}
export interface TodayResponse {
  today: {
    date: string;
    cur_unit: string;
    cur_nmf: string;
    rate: number;
  };
}
function formatCode(code: string): string {
  if (code === "JPY" || code === "IDR") {
    return `${code}(100)`;
  }
  return code;
}

// ── 단일 환율 조회 ──
// GET  /latest?base={base}&symbols={target}
export const getRate = (code: string) =>
  api.get<TodayResponse>(`/currency/overview/${formatCode(code)}/`);

// ── 시계열 조회 ──
// GET  /timeseries?start_date={start}&end_date={end}&base={base}&symbols={target}
export const getTimeSeries = (
  base: string,
  target: string,
  start: string, // "YYYY-MM-DD"
  end: string // "YYYY-MM-DD"
) =>
  api.get<{
    base: string;
    start_date: string;
    end_date: string;
    rates: Record<string, Record<string, number>>;
    // { "2025-05-07": { "USD": 1400.4 }, ... }
  }>("/timeseries", {
    params: {
      start_date: start,
      end_date: end,
      base,
      symbols: target,
    },
  });

// ── 오늘 + 히스토리 조회 ──
// GET  /currency/overview/{code}/  → today, history, memos
export const getHistory = async (code: string): Promise<HistoryResponse> => {
  // AsyncStorage에서 JWT 토큰을 읽어옵니다.
  const token = await AsyncStorage.getItem("@jwt");

  // 토큰이 있으면 요청 헤더에 Authorization을 붙입니다.
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // ① 응답 전체를 받아서 res에 저장
  const res = await api.get<HistoryResponse>(
    `/currency/overview/${code}/`,
    config
  );

  // ② 콘솔에 찍어보기
  //console.log(
  //`📥 getHistory(${code}) 응답:`,
  //JSON.stringify(res.data, null, 2)
  //);

  // config 객체를 두 번째 인자로 전달하여 헤더를 포함시킵니다.
  const { data } = await api.get<HistoryResponse>(
    `/currency/overview/${code}/`,
    config
  );
  return data;
};
