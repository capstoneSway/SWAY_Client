// app/api/rate.ts
import { api } from "./axios"; // axios.ts 에서 export const api = axios.create(...)

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
// GET  /history/{code}
export const getHistory = (code: string) =>
  api.get<HistoryResponse>(`/currency/overview/${code}/`);
